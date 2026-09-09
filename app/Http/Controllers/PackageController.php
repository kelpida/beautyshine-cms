<?php

namespace App\Http\Controllers;

use App\Http\Requests\Package\StorePackageRequest;
use App\Http\Requests\Package\UpdatePackageRequest;
use App\Http\Resources\Package\Attributes\AttributeCategoryResource;
use App\Http\Resources\Package\IndexPackageResource;
use App\Http\Resources\Package\PackageResource;
use App\Http\Resources\Package\PublicPackageResource;
use App\Http\Resources\UploadFile\UploadFileResource;
use App\Models\AttributeCategory;
use App\Models\Language;
use App\Models\Package;
use App\Models\PackageCategory;
use App\Models\PackageGender;
use App\Models\PackageAge;
use App\Models\PackageStatus;
use App\Models\Store;
use App\Models\UploadFile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class PackageController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Package::with(['testCategories', 'packageCategory', 'packageStatus']);

        // Filter by search terms
        foreach (['number', 'name', 'category', 'age_group'] as $field) {
            if ($request->filled($field)) {
                $query->where($field, 'like', '%' . $request->input($field) . '%');
            }
        }

        $packages = $query
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Package/Main/PackagesIndexPage', [
            'packages' => IndexPackageResource::collection($packages),
            'filters' => $request->only([
                'number',
                'name',
                'category',
                'age_group',
            ]),
        ]);
    }

    /**
     * Public API listing
     */
    public function publicIndex(Request $request)
    {
        $perPage = $request->get('per_page', 12);

        $query = Package::whereNull('deleted_at')
            ->with([
                'translates',
                'attributes',
                'testCategories',
                'mainImage',
                'packageCategory',
                'packageStatus',
            ]);

        // Filter by category
        if ($request->filled('category')) {
            $query->where('category', $request->input('category'));
        }

        // Filter by age group
        if ($request->filled('age_group')) {
            $query->where('age_group', $request->input('age_group'));
        }

        // Search
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request->boolean('featured')) {
            return PublicPackageResource::collection(
                $query->where('is_featured', true)->get()
            );
        }

        return PublicPackageResource::collection(
            $query->paginate($perPage)
        );
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $package = new Package();
        $attributesCategories = AttributeCategory::where('deleted_at', null)->with('attributes.options')->get();
        $images = UploadFile::where('type', 'image')->get();
        $files = UploadFile::where('type', 'file')->get();
        $stores = Store::whereNull('deleted_at')->get();

        return Inertia::render('Package/Main/PackagesFormPage', [
            'package' => $package,
            'languages' => Language::where('is_active', true)->whereNull('deleted_at')->get(),
            'packageCategories' => PackageCategory::all(),
            'packageGenders' => PackageGender::all(),
            'packageAges' => PackageAge::all(),
            'packageStatuses' => PackageStatus::all(),
            'categoriesAttributes' => AttributeCategoryResource::collection($attributesCategories),
            'images' => UploadFileResource::collection($images),
            'files' => UploadFileResource::collection($files),
            'stores' => $stores ?? [],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePackageRequest $request)
    {
        $packageValidation = $request->validated();

        // Find the 'en' translation first
        $enTranslate = collect($packageValidation['translates'] ?? [])
            ->firstWhere('locale', 'en');

        if (!$enTranslate) {
            return redirect()->back()->withErrors(['translates' => 'English translation is required.']);
        }

        DB::transaction(function () use ($packageValidation, $enTranslate) {
            // Create the main package with the 'en' translation and other fields
            $package = Package::create([
                'name' => $enTranslate['name'],
                'description' => $enTranslate['description'] ?? null,
                'path' => $packageValidation['path'],
                'number' => $packageValidation['number'] ?? null,
                'subtitle' => $packageValidation['subtitle'] ?? null,
                'price' => $packageValidation['price'],
                'duration' => $packageValidation['duration'],
                'preparation' => $packageValidation['preparation'] ?? null,
                'tests' => $packageValidation['tests'] ?? null,
                'faq' => $packageValidation['faq'] ?? null,
                'main_image_id' => $packageValidation['main_image_id'],
                'is_featured' => $packageValidation['is_featured'] ?? false,
                // 'package_category_id' => $packageValidation['package_category_id'] ?? null,
                'package_gender_id' => $packageValidation['package_gender_id'] ?? null,
                'package_age_id' => $packageValidation['package_age_id'] ?? null,
                'package_status_id' => $packageValidation['package_status_id'] ?? null,
            ]);
            $package->categories()->sync($packageValidation['package_category_ids'] ?? []);
            // Create other translations
            foreach ($packageValidation['translates'] ?? [] as $translate) {
                if ($translate['locale'] != 'en') {
                    $package->translates()->create([
                        'locale' => $translate['locale'],
                        'name' => $translate['name'],
                        'description' => $translate['description'] ?? null,
                    ]);
                }
            }

            if (isset($packageValidation['capacities'])) {
                foreach ($packageValidation['capacities'] as $capacityKey => $value) {
                    $package->packageCapacities()->create([
                        'store_id' => $value["store_id"],
                        'max_concurrent_bookings' => $value["max_bookings"],
                    ]);
                }
            }

            // Sync Attributes
            if (isset($packageValidation['attributes'])) {
                $attributesToSync = [];
                foreach ($packageValidation['attributes'] as $attributeId => $value) {
                    if ($value !== null && $value !== '') {
                        $storeValue = is_array($value) && isset($value['id']) ? $value['id'] : $value;
                        $attributesToSync[$attributeId] = ['value' => $storeValue];
                    }
                }
                $package->attributes()->sync($attributesToSync);
            }

            // Sync Test Categories
            if (isset($packageValidation['test_category_ids'])) {
                $package->testCategories()->sync($packageValidation['test_category_ids']);
            } else {
                $package->testCategories()->sync([]);
            }

            // Sync Gallery
            if (isset($packageValidation['gallery'])) {
                $galleryToSync = [];
                foreach ($packageValidation['gallery'] as $index => $imageId) {
                    $galleryToSync[$imageId] = ['order_id' => $index];
                }
                $package->gallery()->sync($galleryToSync);
            }
        });

        return redirect()->route('packages.index')->with('success', 'Package created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Package $package)
    {
        $package->load(['translates', 'attributes', 'testCategories', 'packageCategory', 'packageCapacities', 'packageGender', 'packageAge', 'packageStatus', 'mainImage', 'gallery', 'auditLogs.user', "categories"]);

        $attributesCategories = AttributeCategory::where('deleted_at', null)->with('attributes.options')->get();
        $images = UploadFile::where('type', 'image')->get();
        $files = UploadFile::where('type', 'file')->get();
        $stores = Store::whereNull('deleted_at')->get();



        return Inertia::render('Package/Main/PackagesFormPage', [
            'package' => new PackageResource($package),
            'languages' => Language::where('is_active', true)->whereNull('deleted_at')->get(),
            'packageCategories' => PackageCategory::all(),
            'packageGenders' => PackageGender::all(),
            'packageAges' => PackageAge::all(),
            'packageStatuses' => PackageStatus::all(),
            'categoriesAttributes' => AttributeCategoryResource::collection($attributesCategories),
            'images' => UploadFileResource::collection($images),
            'files' => UploadFileResource::collection($files),
            'auditLogs' => $package->auditLogs,
            'stores' => $stores ?? [],

        ]);
    }

    /**
     * Public show method for API
     */
    public function publicShow($idOrPath)
    {
        // Try to find package by path, slug (from ID column in packages.js), number, or numeric ID
        $package = Package::whereNull('deleted_at')
            ->where(function ($query) use ($idOrPath) {
                $query->where('path', $idOrPath)
                    ->orWhere('id', $idOrPath)
                    ->orWhere('number', $idOrPath);

                // Also check if it matches the slug pattern from the original packages.js
                // (stored in the path column during import)
            })
            ->with([
                'translates',
                'attributes',
                'testCategories',
                'packageCategory',
                'packageGender',
                'packageAge',
                'packageStatus',
                'mainImage',
                'gallery',
            ])
            ->firstOrFail();

        return new PublicPackageResource($package);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Package $package)
    {
        $package->load(['translates', 'attributes', 'packageCategory', 'packageGender', 'packageCapacities', 'packageAge', 'packageStatus', 'mainImage', 'gallery', 'auditLogs.user']);

        $attributesCategories = AttributeCategory::where('deleted_at', null)->with('attributes.options')->get();
        $images = UploadFile::where('type', 'image')->get();
        $files = UploadFile::where('type', 'file')->get();
        $stores = Store::whereNull('deleted_at')->get();


        return Inertia::render('Package/Main/PackagesFormPage', [
            'package' => new PackageResource($package),
            'languages' => Language::where('is_active', true)->whereNull('deleted_at')->get(),
            'packageCategories' => PackageCategory::all(),
            'packageGenders' => PackageGender::all(),
            'packageAges' => PackageAge::all(),
            'packageStatuses' => PackageStatus::all(),
            'categoriesAttributes' => AttributeCategoryResource::collection($attributesCategories),
            'images' => UploadFileResource::collection($images),
            'files' => UploadFileResource::collection($files),
            'auditLogs' => $package->auditLogs,
            'stores' => $stores ?? [],

        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdatePackageRequest $request, Package $package)
    {
        $packageValidation = $request->validated();

        Log::info('Updating Package ID: ', $packageValidation);

        // Find the 'en' translation first
        $enTranslate = collect($packageValidation['translates'] ?? [])
            ->firstWhere('locale', 'en');

        if (!$enTranslate) {
            return redirect()->back()->withErrors(['translates' => 'English translation is required.']);
        }

        DB::transaction(function () use ($package, $packageValidation, $enTranslate) {
            // Update the main package
            $package->update([
                'name' => $enTranslate['name'],
                'description' => $enTranslate['description'] ?? null,
                'path' => $packageValidation['path'],
                'number' => $packageValidation['number'] ?? null,
                'subtitle' => $packageValidation['subtitle'] ?? null,
                'price' => $packageValidation['price'],
                'duration' => $packageValidation['duration'],
                'preparation' => $packageValidation['preparation'] ?? null,
                'tests' => $packageValidation['tests'] ?? null,
                'faq' => $packageValidation['faq'] ?? null,
                'main_image_id' => $packageValidation['main_image_id'],
                'is_featured' => $packageValidation['is_featured'] ?? false,
                // 'package_category_id' => $packageValidation['package_category_id'] ?? null,
                'package_gender_id' => $packageValidation['package_gender_id'] ?? null,
                'package_age_id' => $packageValidation['package_age_id'] ?? null,
                'package_status_id' => $packageValidation['package_status_id'] ?? null,
            ]);
            $package->categories()->sync($packageValidation['package_category_ids'] ?? []);
            // Update or Create translations
            foreach ($packageValidation['translates'] ?? [] as $translate) {
                if ($translate['locale'] != 'en') {
                    $package->translates()->updateOrCreate(
                        ['locale' => $translate['locale']],
                        [
                            'name' => $translate['name'],
                            'description' => $translate['description'] ?? null,
                        ]
                    );
                }
            }

            $package->packageCapacities()->delete();

            if (!empty($packageValidation['capacities'])) {

                foreach ($packageValidation['capacities'] as $capacity) {

                    $package->packageCapacities()->create([
                        'store_id' => $capacity['store_id'],
                        'max_concurrent_bookings' => $capacity['max_bookings'],
                    ]);
                }
            }

            // Sync Attributes
            if (isset($packageValidation['attributes'])) {
                $attributesToSync = [];
                foreach ($packageValidation['attributes'] as $attributeId => $value) {
                    if ($value !== null && $value !== '') {
                        $storeValue = is_array($value) && isset($value['id']) ? $value['id'] : $value;
                        $attributesToSync[$attributeId] = ['value' => $storeValue];
                    }
                }
                $package->attributes()->sync($attributesToSync);
            } else {
                $package->attributes()->detach();
            }

            // Sync Test Categories
            if (isset($packageValidation['test_category_ids'])) {
                $package->testCategories()->sync($packageValidation['test_category_ids']);
            } else {
                $package->testCategories()->sync([]);
            }

            // Sync Gallery
            if (isset($packageValidation['gallery'])) {
                $galleryToSync = [];
                foreach ($packageValidation['gallery'] as $index => $imageId) {
                    $galleryToSync[$imageId] = ['order_id' => $index];
                }
                $package->gallery()->sync($galleryToSync);
            } else {
                $package->gallery()->detach();
            }
        });

        return redirect()->route('packages.index')->with('success', 'Package updated successfully.');
    }

    /**
     * Duplicate Package
     */
    public function duplicate(Package $package)
    {
        DB::transaction(function () use ($package) {
            $package->load([
                'translates',
                'attributes',
                'gallery',
            ]);

            $enTranslate = $package->translates->firstWhere('locale', 'en');

            if (!$enTranslate) {
                throw new \Exception('English translation missing. Cannot duplicate.');
            }

            $newPackage = Package::create([
                'name' => $enTranslate->name . ' - Copy',
                'description' => $enTranslate->description,
                'path' => $package->path . '-copy-' . time(),
                'number' => $package->number,
                'subtitle' => $package->subtitle,
                'price' => $package->price,
                'category' => $package->category,
                'age_group' => $package->age_group,
                'purpose' => $package->purpose,
                'preparation' => $package->preparation,
                'tests' => $package->tests,
                'faq' => $package->faq,
                'main_image_id' => $package->main_image_id,
                'is_featured' => false,
            ]);

            // Duplicate translations
            foreach ($package->translates as $translate) {
                if ($translate->locale === 'en') continue;
                $newPackage->translates()->create([
                    'locale' => $translate->locale,
                    'name' => $translate->name,
                    'description' => $translate->description,
                ]);
            }

            // Duplicate attributes
            $attributesToSync = [];
            foreach ($package->attributes as $attribute) {
                $attributesToSync[$attribute->id] = ['value' => $attribute->pivot->value];
            }
            $newPackage->attributes()->sync($attributesToSync);

            // Duplicate gallery
            $galleryToSync = [];
            foreach ($package->gallery as $image) {
                $galleryToSync[$image->id] = ['order_id' => $image->pivot->order_id];
            }
            $newPackage->gallery()->sync($galleryToSync);
        });

        return redirect()
            ->route('packages.index')
            ->with('success', 'Package duplicated successfully.');
    }

    /**
     * Import packages from JSON file
     */
    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:json,txt',
            'update_existing' => 'boolean',
        ]);

        $file = $request->file('file');
        $jsonContent = file_get_contents($file->getRealPath());
        $data = json_decode($jsonContent, true);

        if (!$data || !isset($data['packages'])) {
            return back()->withErrors(['file' => 'Invalid JSON format. Expected structure: {"packages": [...]}']);
        }

        $packages = $data['packages'];
        $imported = 0;
        $updated = 0;
        $skipped = 0;

        // First, auto-create categories
        $uniqueCategories = collect($packages)
            ->pluck('category')
            ->filter()
            ->unique()
            ->values();

        foreach ($uniqueCategories as $categoryName) {
            $categoryKey = \Illuminate\Support\Str::slug($categoryName);
            PackageCategory::firstOrCreate(
                ['key' => $categoryKey],
                ['name' => $categoryName]
            );
        }

        // Auto-create default package status
        PackageStatus::firstOrCreate(
            ['key' => 'available'],
            ['name' => 'Available']
        );

        foreach ($packages as $packageData) {
            // Extract price from string like "€150"
            $price = $this->extractPriceFromString($packageData['price'] ?? '0');

            // Use the ID from packages.js as the path (slug), fallback to generating from title
            $path = $packageData['id'] ?? \Illuminate\Support\Str::slug($packageData['title'] ?? 'untitled');

            // Check if package exists by number or path
            $existing = Package::where('number', $packageData['number'] ?? null)
                ->orWhere('path', $path)
                ->first();

            $packageAttributes = [
                'name' => $packageData['title'] ?? 'Untitled',
                'path' => $path,
                'number' => $packageData['number'] ?? null,
                'subtitle' => $packageData['subtitle'] ?? null,
                'description' => $packageData['description'] ?? null,
                'price' => $price,
                'currency' => 'EUR',
                'category' => $packageData['category'] ?? null,
                'age_group' => $packageData['ageGroup'] ?? null,
                'purpose' => $packageData['purpose'] ?? null,
                'preparation' => isset($packageData['preparation']) ? json_encode($packageData['preparation']) : null,
                'tests' => isset($packageData['tests']) ? json_encode($packageData['tests']) : null,
                'faq' => isset($packageData['faq']) ? json_encode($packageData['faq']) : null,
                'public_status' => 'public',
                'is_featured' => false,
            ];

            if ($existing) {
                if ($request->boolean('update_existing')) {
                    $existing->update($packageAttributes);
                    $updated++;
                } else {
                    $skipped++;
                }
            } else {
                Package::create($packageAttributes);
                $imported++;
            }
        }

        $message = "Import completed! Imported: {$imported}";
        if ($request->boolean('update_existing')) {
            $message .= ", Updated: {$updated}";
        }
        if ($skipped > 0) {
            $message .= ", Skipped: {$skipped}";
        }

        return redirect()
            ->route('packages.index')
            ->with('success', $message);
    }

    /**
     * Extract numeric price from string like "€150"
     */
    private function extractPriceFromString(string $priceString): float
    {
        // Remove currency symbols and whitespace, keep numbers and decimal points
        $cleaned = preg_replace('/[^0-9.]/', '', $priceString);
        return floatval($cleaned) ?: 0.00;
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Package $package)
    {
        $package->delete();
        return redirect()->route('packages.index')->with('success', 'Package deleted successfully.');
    }
}
