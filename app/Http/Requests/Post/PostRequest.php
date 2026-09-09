<?php

namespace App\Http\Requests\Post;

use Illuminate\Foundation\Http\FormRequest;

class PostRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => 'required|string',
            'path' => 'required|string',
            'content' => 'required|string',
            'category_id' => 'required|exists:post_categories,id',
            'author_id' => 'required|exists:users,id',
            'image_id' =>  'required|exists:upload_files,id',
            // seo
            'meta_title' => 'required|string',
            'meta_description' => 'required|string',
            'meta_image' => 'nullable|exists:upload_files,id',
        ];
    }
}
