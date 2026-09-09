<?php

namespace App\Http\Requests\Page;

use Illuminate\Foundation\Http\FormRequest;

class PageRequest extends FormRequest
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

            "title" => "required|string",
            "path" => "required|string|unique:pages,path," . $this->route('page'),
            "page_name" => "required|string",
            "meta_title" => "required|string",
            "meta_description" => "required|string",
            "meta_image_id" => "required|numeric",
        ];
    }
}
