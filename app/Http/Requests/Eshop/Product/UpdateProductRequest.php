<?php

namespace App\Http\Requests\Eshop\Product;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class UpdateProductRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Prepare the data for validation.
     * Clean up empty translations, normalize default English values, and filter out 'en'.
     */
    protected function prepareForValidation(): void
    {
        $translations = $this->translations ?? $this->product_translations;

        if (is_array($translations)) {
            $enTranslation = collect($translations)->firstWhere('locale', 'en');

            $name = $this->name;
            if ((empty($name) || trim($name) === '') && !empty($enTranslation['name'])) {
                $name = trim($enTranslation['name']);
            }

            $slug = $this->slug;
            if ((empty($slug) || trim($slug) === '') && !empty($name)) {
                $slug = Str::slug($name);
            }

            $description = $this->description ?? $enTranslation['description'] ?? null;
            $shortDescription = $this->short_description ?? $enTranslation['short_description'] ?? null;
            $allergensText = $this->allergens_text ?? $enTranslation['allergens_text'] ?? null;
            $deliveryInfo = $this->delivery_info ?? $enTranslation['delivery_info'] ?? null;
            $productCare = $this->product_care ?? $enTranslation['product_care'] ?? null;

            $filtered = array_values(array_filter($translations, function ($item) {
                return !empty(trim($item['name'] ?? '')) && ($item['locale'] ?? '') !== 'en';
            }));

            $this->merge([
                'name' => $name,
                'slug' => $slug,
                'description' => $description,
                'short_description' => $shortDescription,
                'allergens_text' => $allergensText,
                'delivery_info' => $deliveryInfo,
                'product_care' => $productCare,
                'translations' => $filtered,
                'product_translations' => $filtered,
            ]);
        } else {
            if ((empty($this->slug) || trim($this->slug) === '') && !empty($this->name)) {
                $this->merge([
                    'slug' => Str::slug($this->name),
                ]);
            }
        }
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $product = $this->route('eshop_product') ?? $this->route('product');
        $productId = is_object($product) ? $product->id : $product;

        return [
            // General Information
            'name' => 'required|string|max:255',
            'slug' => [
                'required',
                'string',
                'max:255',
                Rule::unique('products', 'slug')->ignore($productId),
            ],
            'description' => 'nullable|string',
            'short_description' => 'nullable|string',
            'product_type' => 'required|in:simple,configurable',
            'is_customizable' => 'nullable|boolean',
            'status' => 'nullable|in:draft,public,archived,inactive',
            'sort_order' => 'nullable|integer',
            'base_price' => 'nullable|numeric|min:0',
            'sale_price' => 'nullable|numeric|min:0',
            'allergens_text' => 'nullable|string',
            'delivery_info' => 'nullable|string',
            'product_care' => 'nullable|string',
            'is_active' => 'required|boolean',

            // Multi-language translations
            'translations' => 'nullable|array',
            'translations.*.locale' => ['required', 'string', 'max:10', 'distinct', 'exists:languages,code'],
            'translations.*.name' => ['required', 'string', 'max:255'],
            'translations.*.description' => ['nullable', 'string'],
            'translations.*.short_description' => ['nullable', 'string'],
            'translations.*.allergens_text' => ['nullable', 'string'],
            'translations.*.delivery_info' => ['nullable', 'string'],
            'translations.*.product_care' => ['nullable', 'string'],

            // Media
            'main_image_id' => 'nullable|integer|exists:upload_files,id',
            'product_images' => 'nullable|array',
            'product_images.*' => 'integer|exists:upload_files,id',

            // Taxonomy
            'eshop_categories' => 'nullable|array',
            'eshop_categories.*' => 'integer|exists:eshop_categories,id',
            'category_ids' => 'nullable|array',
            'category_ids.*' => 'integer|exists:eshop_categories,id',
            'eshop_tags' => 'nullable|array',
            'eshop_tags.*' => 'integer|exists:tags,id',
            'tag_ids' => 'nullable|array',
            'tag_ids.*' => 'integer|exists:tags,id',

            // Gallery images
            'gallery_images' => 'nullable|array',
            'gallery_images.*' => 'integer|exists:upload_files,id',

            // SEO & Additional flow fields
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
            'meta_keywords' => 'nullable|string|max:255',
            'attributes' => 'nullable|array',
            'variations' => 'nullable|array',
            'addons' => 'nullable|array',
            'custom_fields' => 'nullable|array',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'The product name is required.',
            'slug.required' => 'The product slug is required.',
            'slug.unique' => 'This slug is already in use by another product.',
            'translations.*.locale.required' => 'A valid language code is required for each translation.',
            'translations.*.locale.exists' => 'The selected translation language does not exist.',
            'translations.*.locale.distinct' => 'Each translation must be for a unique language.',
            'translations.*.name.required' => 'The translated product name is required.',
        ];
    }
}
