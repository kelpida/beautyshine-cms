<?php

namespace App\Http\Controllers;

use App\Http\Resources\Eshop\Product\PublicSingleProductResource;
use App\Models\Eshop\Product;
use App\Models\Eshop\EshopCategory;
use App\Models\Eshop\Tag;
use App\Models\Eshop\Attribute;
use App\Models\Language;
use App\Models\UploadFile;
use App\Http\Requests\Eshop\Product\StoreProductRequest;
use App\Http\Requests\Eshop\Product\UpdateProductRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Product::query()
            ->with(['mainImage', 'translates', 'categories', 'tags'])
            ->when($request->q, function ($q, $search) {
                $q->where(function ($sub) use ($search) {
                    $sub->where('name', 'like', "%{$search}%")
                        ->orWhere('slug', 'like', "%{$search}%");
                });
            })
            ->when($request->status, function ($q, $status) {
                $q->where('status', $status);
            })
            ->when($request->product_type, function ($q, $type) {
                $q->where('product_type', $type);
            })
            ->orderBy('sort_order', 'asc')
            ->orderBy('id', 'desc');

        return Inertia::render('Eshop/Product/IndexProductPage', [
            'products' => $query->paginate(15)->withQueryString(),
            'filters' => [
                'q' => $request->q,
                'status' => $request->status,
                'product_type' => $request->product_type,
            ],
            'languages' => Language::active()->get(),
        ]);
    }

    public function publicIndex(Request $request)
    {
        $query = Product::query()
            ->where('is_active', true)
            ->where('status', 'public')
            ->with([
                'mainImage',
                'galleryImages',
                'translates',
                'categories.translates',
                'tags.translates',
                'productAttributes.attribute',
                'productAttributes.options.translates',
                'variations.attributeOptions',
                'variations.translates',
                'addons.translates',
                'customFields.translates',
                'seo.image',
            ]);
        // sort by price asc, price desc, newest, oldest, sort_order
        $sort = $request->query('sort') ?? $request->query('sort_by');

        switch ($sort) {
            case 'price_asc':
            case 'price_low_high':
            case 'price_low_to_high':
            case 'low-high':
            case 'low_to_high':
                $query->orderByRaw('COALESCE(sale_price, base_price) ASC')
                    ->orderBy('id', 'desc');
                break;

            case 'price_desc':
            case 'price_high_low':
            case 'price_high_to_low':
            case 'high-low':
            case 'high_to_low':
                $query->orderByRaw('COALESCE(sale_price, base_price) DESC')
                    ->orderBy('id', 'desc');
                break;

            case 'newest':
            case 'latest':
            case 'date_desc':
                $query->orderBy('created_at', 'desc')
                    ->orderBy('id', 'desc');
                break;

            case 'oldest':
            case 'date_asc':
                $query->orderBy('created_at', 'asc')
                    ->orderBy('id', 'asc');
                break;

            case 'sort_order':
            case 'popular':
            default:
                $query->orderBy('sort_order', 'asc')
                    ->orderBy('id', 'desc');
                break;
        }

        $filter = $request->query('filter') ?? [];

        if (!empty($filter['categories'])) {
            $query->whereHas('categories', function ($q) use ($filter) {
                $q->whereIn('id', $filter['categories']);
            });
        }

        if (!empty($filter['tags'])) {
            $query->whereHas('tags', function ($q) use ($filter) {
                $q->whereIn('id', $filter['tags']);
            });
        }

        // filters by price
        if (!empty($filter['price'])) {
            $query->where('base_price', '>=', $filter['price']['min'])
                ->where('base_price', '<=', $filter['price']['max']);
        }

        // filters by attributes
        if (!empty($filter['attributes'])) {
            $query->whereHas('productAttributes', function ($q) use ($filter) {
                $q->whereIn('attribute_id', $filter['attributes']);
            });
        }

        $perPage = (int) $request->query('per_page', 15);
        $products = $query->paginate($perPage)->withQueryString();

        return PublicSingleProductResource::collection($products);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $languages = Language::active()->get();
        $categories = EshopCategory::query()->with('translates')->orderBy('sort_order')->get();
        $tags = Tag::query()->with('translates')->orderBy('sort_order')->get();
        $attributes = Attribute::query()->with('translates')->orderBy('sort_order')->get();

        $availableImages = UploadFile::where('type', 'image')->latest()->get();

        return Inertia::render('Eshop/Product/FormProductPage', [
            'product' => null,
            'languages' => $languages,
            'categories' => $categories,
            'tags' => $tags,
            'availableAttributes' => $attributes,
            'availableImages' => $availableImages,
            'nextSortOrder' => Product::nextSortOrder(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreProductRequest $request)
    {
        $validated = $request->validated();

        DB::transaction(function () use ($validated) {
            $product = Product::create([
                'name' => $validated['name'],
                'slug' => $validated['slug'],
                'description' => $validated['description'] ?? null,
                'short_description' => $validated['short_description'] ?? null,
                'main_image_id' => $validated['main_image_id'] ?? null,
                'base_price' => $validated['base_price'] ?? null,
                'sale_price' => $validated['sale_price'] ?? null,
                'product_type' => $validated['product_type'] ?? 'simple',
                'is_customizable' => $validated['is_customizable'] ?? false,
                'status' => $validated['status'] ?? 'draft',
                'sort_order' => $validated['sort_order'] ?? Product::nextSortOrder(),
                'allergens_text' => $validated['allergens_text'] ?? null,
                'delivery_info' => $validated['delivery_info'] ?? null,
                'product_care' => $validated['product_care'] ?? null,
                'is_active' => $validated['is_active'] ?? true,
            ]);

            // Translations
            if (!empty($validated['translations'])) {
                foreach ($validated['translations'] as $trans) {
                    if (!empty($trans['locale']) && $trans['locale'] !== 'en') {
                        $product->translates()->create([
                            'locale' => $trans['locale'],
                            'name' => $trans['name'],
                            'description' => $trans['description'] ?? null,
                            'short_description' => $trans['short_description'] ?? null,
                            'allergens_text' => $trans['allergens_text'] ?? null,
                            'delivery_info' => $trans['delivery_info'] ?? null,
                            'product_care' => $trans['product_care'] ?? null,
                        ]);
                    }
                }
            }

            // Categories & Tags
            $categoryIds = $validated['category_ids'] ?? $validated['eshop_categories'] ?? [];
            $product->categories()->sync($categoryIds);

            $tagIds = $validated['tag_ids'] ?? $validated['eshop_tags'] ?? [];
            $product->tags()->sync($tagIds);

            // Gallery images
            $galleryIds = $validated['gallery_images'] ?? $validated['product_images'] ?? [];
            foreach ($galleryIds as $idx => $imgId) {
                $product->productImages()->create([
                    'upload_file_id' => $imgId,
                    'sort_order' => $idx + 1,
                ]);
            }

            // SEO Metadata
            if (!empty($validated['meta_title']) || !empty($validated['meta_description'])) {
                $product->seo()->updateOrCreate([], [
                    'meta_title' => $validated['meta_title'] ?? null,
                    'meta_description' => $validated['meta_description'] ?? null,
                    'image_id' => $validated['main_image_id'] ?? null,
                ]);
            }

            // Attributes & Options
            if (!empty($validated['attributes']) && is_array($validated['attributes'])) {
                foreach ($validated['attributes'] as $attrIndex => $attrData) {
                    if (empty($attrData['attribute_id']))
                        continue;
                    $pAttr = $product->productAttributes()->create([
                        'attribute_id' => $attrData['attribute_id'],
                        'is_required' => $attrData['is_required'] ?? false,
                        'sort_order' => $attrData['sort_order'] ?? ($attrIndex + 1),
                    ]);
                    if (!empty($attrData['options']) && is_array($attrData['options'])) {
                        foreach ($attrData['options'] as $optIndex => $optData) {
                            if (empty($optData['name']))
                                continue;
                            $pOpt = $pAttr->options()->create([
                                'name' => $optData['name'],
                                'extra_price' => $optData['extra_price'] ?? 0,
                                'is_available' => $optData['is_available'] ?? true,
                                'sort_order' => $optData['sort_order'] ?? ($optIndex + 1),
                            ]);
                            if (!empty($optData['translations'])) {
                                foreach ($optData['translations'] as $optTrans) {
                                    if (!empty($optTrans['locale']) && $optTrans['locale'] !== 'en') {
                                        $pOpt->translates()->create([
                                            'locale' => $optTrans['locale'],
                                            'name' => $optTrans['name'],
                                        ]);
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // Variations
            if (!empty($validated['variations']) && is_array($validated['variations'])) {
                foreach ($validated['variations'] as $varData) {
                    if (empty($varData['sku']) || empty($varData['name']))
                        continue;
                    $variation = $product->variations()->create([
                        'sku' => $varData['sku'],
                        'name' => $varData['name'],
                        'short_description' => $varData['short_description'] ?? null,
                        'price' => $varData['price'] ?? 0,
                        'sale_price' => $varData['sale_price'] ?? null,
                        'quantity' => $varData['quantity'] ?? 0,
                        'is_available' => $varData['is_available'] ?? true,
                    ]);
                    if (!empty($varData['attribute_option_ids'])) {
                        $variation->attributeOptions()->sync($varData['attribute_option_ids']);
                    }
                    if (!empty($varData['translations'])) {
                        foreach ($varData['translations'] as $varTrans) {
                            if (!empty($varTrans['locale']) && $varTrans['locale'] !== 'en') {
                                $variation->translates()->create([
                                    'locale' => $varTrans['locale'],
                                    'name' => $varTrans['name'],
                                    'short_description' => $varTrans['short_description'] ?? null,
                                ]);
                            }
                        }
                    }
                }
            }

            // Add-ons
            if (!empty($validated['addons']) && is_array($validated['addons'])) {
                foreach ($validated['addons'] as $addIndex => $addonData) {
                    if (empty($addonData['name']))
                        continue;
                    $addon = $product->addons()->create([
                        'name' => $addonData['name'],
                        'description' => $addonData['description'] ?? null,
                        'price' => $addonData['price'] ?? 0,
                        'sale_price' => $addonData['sale_price'] ?? null,
                        'quantity' => $addonData['quantity'] ?? 1,
                        'is_available' => $addonData['is_available'] ?? true,
                        'sort_order' => $addonData['sort_order'] ?? ($addIndex + 1),
                    ]);
                    if (!empty($addonData['translations'])) {
                        foreach ($addonData['translations'] as $addTrans) {
                            if (!empty($addTrans['locale']) && $addTrans['locale'] !== 'en') {
                                $addon->translates()->create([
                                    'locale' => $addTrans['locale'],
                                    'name' => $addTrans['name'],
                                    'description' => $addTrans['description'] ?? null,
                                ]);
                            }
                        }
                    }
                }
            }

            // Custom Fields
            if (!empty($validated['custom_fields']) && is_array($validated['custom_fields'])) {
                foreach ($validated['custom_fields'] as $cfIndex => $cfData) {
                    if (empty($cfData['name']))
                        continue;
                    $cf = $product->customFields()->create([
                        'name' => $cfData['name'],
                        'key' => $cfData['key'] ?? Str::slug($cfData['name'], '_') . '_' . $cfIndex,
                        'field_type' => $cfData['field_type'] ?? 'text',
                        'is_required' => $cfData['is_required'] ?? false,
                        'max_length' => $cfData['max_length'] ?? null,
                        'sort_order' => $cfData['sort_order'] ?? ($cfIndex + 1),
                        'is_active' => $cfData['is_active'] ?? true,
                    ]);
                    if (!empty($cfData['translations'])) {
                        foreach ($cfData['translations'] as $cfTrans) {
                            if (!empty($cfTrans['locale']) && $cfTrans['locale'] !== 'en') {
                                $cf->translates()->create([
                                    'locale' => $cfTrans['locale'],
                                    'name' => $cfTrans['name'],
                                ]);
                            }
                        }
                    }
                }
            }

            return $product;
        });

        return redirect()->route('eshop-products.index')
            ->with('success', 'Product created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Product $product)
    {
        return redirect()->route('eshop-products.edit', $product->id);
    }

    public function publicShow(Product $product)
    {
        $product->load([
            'translates',
            'mainImage',
            'galleryImages',
            'productImages.image',
            'categories',
            'tags',
            'productAttributes.attribute',
            'productAttributes.options.translates',
            'variations.attributeOptions',
            'variations.translates',
            'addons.translates',
            'customFields.translates',
            'seo',
        ]);

        return new PublicSingleProductResource($product);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Product $eshop_product)
    {
        $eshop_product->load([
            'translates',
            'mainImage',
            'galleryImages',
            'productImages.image',
            'categories',
            'tags',
            'productAttributes.attribute',
            'productAttributes.options.translates',
            'variations.attributeOptions',
            'variations.translates',
            'addons.translates',
            'customFields.translates',
            'seo',
        ]);

        return Inertia::render('Eshop/Product/FormProductPage', [
            'product' => $eshop_product,
            'languages' => Language::active()->get(),
            'categories' => EshopCategory::query()->with('translates')->orderBy('sort_order')->get(),
            'tags' => Tag::query()->with('translates')->orderBy('sort_order')->get(),
            'availableAttributes' => Attribute::query()->with('translates')->orderBy('sort_order')->get(),
            'availableImages' => UploadFile::where('type', 'image')->latest()->get(),
            'nextSortOrder' => $eshop_product->sort_order,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateProductRequest $request, Product $eshop_product)
    {
        $validated = $request->validated();

        DB::transaction(function () use ($eshop_product, $validated) {
            $eshop_product->update([
                'name' => $validated['name'],
                'slug' => $validated['slug'],
                'description' => $validated['description'] ?? null,
                'short_description' => $validated['short_description'] ?? null,
                'main_image_id' => $validated['main_image_id'] ?? null,
                'base_price' => $validated['base_price'] ?? null,
                'sale_price' => $validated['sale_price'] ?? null,
                'product_type' => $validated['product_type'] ?? 'simple',
                'is_customizable' => $validated['is_customizable'] ?? false,
                'status' => $validated['status'] ?? 'draft',
                'sort_order' => $validated['sort_order'] ?? $eshop_product->sort_order,
                'allergens_text' => $validated['allergens_text'] ?? null,
                'delivery_info' => $validated['delivery_info'] ?? null,
                'product_care' => $validated['product_care'] ?? null,
                'is_active' => $validated['is_active'] ?? true,
            ]);

            // Translations
            $eshop_product->translates()->delete();
            if (!empty($validated['translations'])) {
                foreach ($validated['translations'] as $trans) {
                    if (!empty($trans['locale']) && $trans['locale'] !== 'en') {
                        $eshop_product->translates()->create([
                            'locale' => $trans['locale'],
                            'name' => $trans['name'],
                            'description' => $trans['description'] ?? null,
                            'short_description' => $trans['short_description'] ?? null,
                            'allergens_text' => $trans['allergens_text'] ?? null,
                            'delivery_info' => $trans['delivery_info'] ?? null,
                            'product_care' => $trans['product_care'] ?? null,
                        ]);
                    }
                }
            }

            // Categories & Tags
            $categoryIds = $validated['category_ids'] ?? $validated['eshop_categories'] ?? [];
            $eshop_product->categories()->sync($categoryIds);

            $tagIds = $validated['tag_ids'] ?? $validated['eshop_tags'] ?? [];
            $eshop_product->tags()->sync($tagIds);

            // Gallery images
            if (isset($validated['gallery_images']) || isset($validated['product_images'])) {
                $galleryIds = $validated['gallery_images'] ?? $validated['product_images'] ?? [];
                $eshop_product->productImages()->delete();
                foreach ($galleryIds as $idx => $imgId) {
                    $eshop_product->productImages()->create([
                        'upload_file_id' => $imgId,
                        'sort_order' => $idx + 1,
                    ]);
                }
            }

            // SEO Metadata
            if (!empty($validated['meta_title']) || !empty($validated['meta_description'])) {
                $eshop_product->seo()->updateOrCreate([], [
                    'meta_title' => $validated['meta_title'] ?? null,
                    'meta_description' => $validated['meta_description'] ?? null,
                    'image_id' => $validated['main_image_id'] ?? null,
                ]);
            }

            // Attributes & Options
            if (isset($validated['attributes']) && is_array($validated['attributes'])) {
                $eshop_product->productAttributes()->delete();
                foreach ($validated['attributes'] as $attrIndex => $attrData) {
                    if (empty($attrData['attribute_id']))
                        continue;
                    $pAttr = $eshop_product->productAttributes()->create([
                        'attribute_id' => $attrData['attribute_id'],
                        'is_required' => $attrData['is_required'] ?? false,
                        'sort_order' => $attrData['sort_order'] ?? ($attrIndex + 1),
                    ]);
                    if (!empty($attrData['options']) && is_array($attrData['options'])) {
                        foreach ($attrData['options'] as $optIndex => $optData) {
                            if (empty($optData['name']))
                                continue;
                            $pOpt = $pAttr->options()->create([
                                'name' => $optData['name'],
                                'extra_price' => $optData['extra_price'] ?? 0,
                                'is_available' => $optData['is_available'] ?? true,
                                'sort_order' => $optData['sort_order'] ?? ($optIndex + 1),
                            ]);
                            if (!empty($optData['translations'])) {
                                foreach ($optData['translations'] as $optTrans) {
                                    if (!empty($optTrans['locale']) && $optTrans['locale'] !== 'en') {
                                        $pOpt->translates()->create([
                                            'locale' => $optTrans['locale'],
                                            'name' => $optTrans['name'],
                                        ]);
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // Variations
            if (isset($validated['variations']) && is_array($validated['variations'])) {
                $eshop_product->variations()->delete();
                foreach ($validated['variations'] as $varData) {
                    if (empty($varData['sku']) || empty($varData['name']))
                        continue;
                    $variation = $eshop_product->variations()->create([
                        'sku' => $varData['sku'],
                        'name' => $varData['name'],
                        'short_description' => $varData['short_description'] ?? null,
                        'price' => $varData['price'] ?? 0,
                        'sale_price' => $varData['sale_price'] ?? null,
                        'quantity' => $varData['quantity'] ?? 0,
                        'is_available' => $varData['is_available'] ?? true,
                    ]);
                    if (!empty($varData['attribute_option_ids'])) {
                        $variation->attributeOptions()->sync($varData['attribute_option_ids']);
                    }
                    if (!empty($varData['translations'])) {
                        foreach ($varData['translations'] as $varTrans) {
                            if (!empty($varTrans['locale']) && $varTrans['locale'] !== 'en') {
                                $variation->translates()->create([
                                    'locale' => $varTrans['locale'],
                                    'name' => $varTrans['name'],
                                    'short_description' => $varTrans['short_description'] ?? null,
                                ]);
                            }
                        }
                    }
                }
            }

            // Add-ons
            if (isset($validated['addons']) && is_array($validated['addons'])) {
                $eshop_product->addons()->delete();
                foreach ($validated['addons'] as $addIndex => $addonData) {
                    if (empty($addonData['name']))
                        continue;
                    $addon = $eshop_product->addons()->create([
                        'name' => $addonData['name'],
                        'description' => $addonData['description'] ?? null,
                        'price' => $addonData['price'] ?? 0,
                        'sale_price' => $addonData['sale_price'] ?? null,
                        'quantity' => $addonData['quantity'] ?? 1,
                        'is_available' => $addonData['is_available'] ?? true,
                        'sort_order' => $addonData['sort_order'] ?? ($addIndex + 1),
                    ]);
                    if (!empty($addonData['translations'])) {
                        foreach ($addonData['translations'] as $addTrans) {
                            if (!empty($addTrans['locale']) && $addTrans['locale'] !== 'en') {
                                $addon->translates()->create([
                                    'locale' => $addTrans['locale'],
                                    'name' => $addTrans['name'],
                                    'description' => $addTrans['description'] ?? null,
                                ]);
                            }
                        }
                    }
                }
            }

            // Custom Fields
            if (isset($validated['custom_fields']) && is_array($validated['custom_fields'])) {
                $eshop_product->customFields()->delete();
                foreach ($validated['custom_fields'] as $cfIndex => $cfData) {
                    if (empty($cfData['name']))
                        continue;
                    $cf = $eshop_product->customFields()->create([
                        'name' => $cfData['name'],
                        'key' => $cfData['key'] ?? Str::slug($cfData['name'], '_') . '_' . $cfIndex,
                        'field_type' => $cfData['field_type'] ?? 'text',
                        'is_required' => $cfData['is_required'] ?? false,
                        'max_length' => $cfData['max_length'] ?? null,
                        'sort_order' => $cfData['sort_order'] ?? ($cfIndex + 1),
                        'is_active' => $cfData['is_active'] ?? true,
                    ]);
                    if (!empty($cfData['translations'])) {
                        foreach ($cfData['translations'] as $cfTrans) {
                            if (!empty($cfTrans['locale']) && $cfTrans['locale'] !== 'en') {
                                $cf->translates()->create([
                                    'locale' => $cfTrans['locale'],
                                    'name' => $cfTrans['name'],
                                ]);
                            }
                        }
                    }
                }
            }
        });

        return redirect()->route('eshop-products.index')
            ->with('success', 'Product updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Product $eshop_product)
    {
        $eshop_product->delete();

        return redirect()->route('eshop-products.index')
            ->with('success', 'Product deleted successfully.');
    }
}
