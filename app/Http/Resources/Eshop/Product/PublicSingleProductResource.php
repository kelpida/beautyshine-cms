<?php

namespace App\Http\Resources\Eshop\Product;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PublicSingleProductResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'product_type' => $this->product_type,
            'status' => $this->status,
            'is_active' => (bool) $this->is_active,
            'is_customizable' => (bool) $this->is_customizable,
            'base_price' => $this->base_price !== null ? (float) $this->base_price : null,
            'sale_price' => $this->sale_price !== null ? (float) $this->sale_price : null,
            'price' => $this->sale_price !== null ? (float) $this->sale_price : ($this->base_price !== null ? (float) $this->base_price : null),
            'short_description' => $this->short_description,
            'description' => $this->description,
            'allergens_text' => $this->allergens_text,
            'delivery_info' => $this->delivery_info,
            'product_care' => $this->product_care,
            'sort_order' => (int) ($this->sort_order ?? 0),

            // Translations
            'translations' => $this->when(
                $this->relationLoaded('translates'),
                fn() => $this->translates->map(fn($t) => [
                    'locale' => $t->locale,
                    'name' => $t->name,
                    'short_description' => $t->short_description,
                    'description' => $t->description,
                    'allergens_text' => $t->allergens_text,
                    'delivery_info' => $t->delivery_info,
                    'product_care' => $t->product_care,
                ]),
                $this->translates?->map(fn($t) => [
                    'locale' => $t->locale,
                    'name' => $t->name,
                    'short_description' => $t->short_description,
                    'description' => $t->description,
                    'allergens_text' => $t->allergens_text,
                    'delivery_info' => $t->delivery_info,
                    'product_care' => $t->product_care,
                ]) ?? []
            ),

            // Main Image
            'main_image' => $this->mainImage ? [
                'id' => $this->mainImage->id,
                'name' => $this->mainImage->name,
                'alt' => $this->mainImage->alt ?? $this->mainImage->name,
                'url' => asset('storage/' . $this->mainImage->path),
            ] : null,

            // Gallery Images
            'gallery_images' => $this->galleryImages ? $this->galleryImages->map(fn($img) => [
                'id' => $img->id,
                'name' => $img->name,
                'alt' => $img->alt ?? $img->name,
                'url' => asset('storage/' . $img->path),
                'sort_order' => $img->pivot->sort_order ?? 0,
            ]) : [],

            // Categories
            'categories' => $this->categories ? $this->categories->map(fn($cat) => [
                'id' => $cat->id,
                'name' => $cat->name,
                'slug' => $cat->slug,
                'description' => $cat->description,
                'image' => $cat->image ? asset('storage/' . $cat->image->path) : null,
                'translations' => $cat->relationLoaded('translates') ? $cat->translates->map(fn($t) => [
                    'locale' => $t->locale,
                    'name' => $t->name,
                    'description' => $t->description,
                ]) : [],
            ]) : [],

            // Tags
            'tags' => $this->tags ? $this->tags->map(fn($tag) => [
                'id' => $tag->id,
                'name' => $tag->name,
                'slug' => $tag->slug,
                'translations' => $tag->relationLoaded('translates') ? $tag->translates->map(fn($t) => [
                    'locale' => $t->locale,
                    'name' => $t->name,
                ]) : [],
            ]) : [],

            // Attributes & Options
            'attributes' => $this->productAttributes ? $this->productAttributes->map(fn($pAttr) => [
                'id' => $pAttr->id,
                'attribute_id' => $pAttr->attribute_id,
                'name' => $pAttr->attribute?->name,
                'slug' => $pAttr->attribute?->slug,
                'format_type' => $pAttr->attribute?->format_type ?? 'select',
                'is_required' => (bool) $pAttr->is_required,
                'sort_order' => (int) $pAttr->sort_order,
                'options' => $pAttr->options ? $pAttr->options->map(fn($opt) => [
                    'id' => $opt->id,
                    'name' => $opt->name,
                    'extra_price' => (float) ($opt->extra_price ?? 0),
                    'is_available' => (bool) $opt->is_available,
                    'sort_order' => (int) $opt->sort_order,
                    'translations' => $opt->relationLoaded('translates') ? $opt->translates->map(fn($t) => [
                        'locale' => $t->locale,
                        'name' => $t->name,
                    ]) : [],
                ]) : [],
            ]) : [],

            // Configurable Variations
            'variations' => $this->variations ? $this->variations->map(fn($v) => [
                'id' => $v->id,
                'sku' => $v->sku,
                'name' => $v->name,
                'short_description' => $v->short_description,
                'price' => (float) $v->price,
                'sale_price' => $v->sale_price !== null ? (float) $v->sale_price : null,
                'quantity' => (int) $v->quantity,
                'is_available' => (bool) $v->is_available,
                'sort_order' => (int) $v->sort_order,
                'attribute_options' => $v->attributeOptions ? $v->attributeOptions->map(fn($opt) => [
                    'id' => $opt->id,
                    'product_attribute_id' => $opt->product_attribute_id,
                    'name' => $opt->name,
                    'extra_price' => (float) ($opt->extra_price ?? 0),
                ]) : [],
                'translations' => $v->relationLoaded('translates') ? $v->translates->map(fn($t) => [
                    'locale' => $t->locale,
                    'name' => $t->name,
                    'short_description' => $t->short_description,
                ]) : [],
            ]) : [],

            // Add-ons
            'addons' => $this->addons ? $this->addons->map(fn($addon) => [
                'id' => $addon->id,
                'name' => $addon->name,
                'description' => $addon->description,
                'price' => (float) $addon->price,
                'sale_price' => $addon->sale_price !== null ? (float) $addon->sale_price : null,
                'quantity' => (int) $addon->quantity,
                'is_available' => (bool) $addon->is_available,
                'sort_order' => (int) $addon->sort_order,
                'translations' => $addon->relationLoaded('translates') ? $addon->translates->map(fn($t) => [
                    'locale' => $t->locale,
                    'name' => $t->name,
                    'description' => $t->description,
                ]) : [],
            ]) : [],

            // Custom Checkout Input Fields
            'custom_fields' => $this->customFields ? $this->customFields->map(fn($cf) => [
                'id' => $cf->id,
                'name' => $cf->name,
                'key' => $cf->key,
                'field_type' => $cf->field_type,
                'is_required' => (bool) $cf->is_required,
                'max_length' => $cf->max_length !== null ? (int) $cf->max_length : null,
                'sort_order' => (int) $cf->sort_order,
                'is_active' => (bool) $cf->is_active,
                'translations' => $cf->relationLoaded('translates') ? $cf->translates->map(fn($t) => [
                    'locale' => $t->locale,
                    'name' => $t->name,
                ]) : [],
            ]) : [],

            // SEO Metadata
            'seo' => $this->seo ? [
                'meta_title' => $this->seo->meta_title,
                'meta_description' => $this->seo->meta_description,
                'image' => $this->seo->image ? asset('storage/' . $this->seo->image->path) : null,
            ] : null,
        ];
    }
}
