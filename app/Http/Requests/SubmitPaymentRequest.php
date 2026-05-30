<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class SubmitPaymentRequest extends FormRequest
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
        $receivable = $this->route('receivable');
        $maxAmount = $receivable ? $receivable->remaining_balance : 0;

        return [
            'amount' => 'required|numeric|min:1000|max:' . $maxAmount,
            'payment_proof' => 'required|image|mimes:jpg,jpeg,png|max:5120',
            'bank_name' => 'nullable|string|max:100',
            'account_number' => 'nullable|string|max:50',
            'transfer_date' => 'required|date',
        ];
    }
}
