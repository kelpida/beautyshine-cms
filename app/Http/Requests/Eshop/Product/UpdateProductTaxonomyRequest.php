<?php

namespace App\Http\Requests\Eshop\Product;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProductTaxonomyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // Categories & Tags
            'category_ids' => 'nullable|array',
            'category_ids.*' => 'integer|exists:eshop_categories,id',
            'tag_ids' => 'nullable|array',
            'tag_ids.*' => 'integer|exists:tags,id',

            // SEO default (e.g. English)
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
            'meta_keywords' => 'nullable|string|max:255',

            // SEO translations (EL, FR, etc.)
            'seo_translations' => 'nullable|array',
            'seo_translations.*.locale' => ['required', 'string', 'max:10', 'distinct', 'exists:languages,code'],
            'seo_translations.*.meta_title' => 'nullable|string|max:255',
            'seo_translations.*.meta_description' => 'nullable|string|max:500',
            'seo_translations.*.meta_keywords' => 'nullable|string|max:255',
        ];
    }

    public function messages(): array
    {
        return [
            'category_ids.*.exists' => 'One or more selected categories do not exist.',
            'tag_ids.*.exists' => 'One or more selected tags do not exist.',
            'seo_translations.*.locale.exists' => 'The selected SEO language is invalid.',
        ];
    }
}
