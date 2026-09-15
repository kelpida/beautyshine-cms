<?php

namespace App\Http\Requests\Eshop\Product;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProductMediaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'main_image_id' => 'nullable|integer|exists:upload_files,id',
            'gallery_images' => 'nullable|array',
            'gallery_images.*' => 'integer|exists:upload_files,id',
            'video_url' => 'nullable|url|max:255',
        ];
    }

    public function messages(): array
    {
        return [
            'main_image_id.exists' => 'The selected main image is invalid.',
            'gallery_images.*.exists' => 'One or more selected gallery images are invalid.',
            'video_url.url' => 'The video link must be a valid URL.',
        ];
    }
}
