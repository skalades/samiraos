<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreAnnouncementRequest extends FormRequest
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
        return [
            'title' => 'required|string|max:200',
            'body' => 'required|string|max:5000',
            'type' => 'required|in:info,warning,promo,urgent',
            'target_role' => 'required|in:all,distributor,agen',
            'attachment' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240',
            'expires_at' => 'nullable|date|after:now',
        ];
    }
}
