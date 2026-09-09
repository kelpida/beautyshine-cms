<?php

namespace App\Http\Requests\BlockContent;

use Illuminate\Foundation\Http\FormRequest;

class StoreBlockContentRequest extends FormRequest
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
            'title' => 'required|string|max:255',
            'component_name' => 'required|string|max:255',
            'page_id' => 'required|exists:pages,id',
            'content' => 'nullable|array',
        ];
    }
}
