<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

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
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $productId = $this->route('product')->id ?? $this->route('product');
        return [
            'name' => 'required|string|max:150|unique:products,name,' . $productId,
            'sku' => 'required|string|max:50|unique:products,sku,' . $productId,
            'description' => 'nullable|string|max:1000',
            'unit' => 'required|string|max:20',
            'weight_grams' => 'nullable|integer|min:1',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'price_pusat' => 'required|numeric|min:0',
            'price_distributor' => 'required|numeric|min:0',
            'price_agen' => 'required|numeric|min:0',
            'is_active' => 'boolean',
        ];
    }
}
