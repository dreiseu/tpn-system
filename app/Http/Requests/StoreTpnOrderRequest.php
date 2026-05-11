<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTpnOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'temporary_request' => $this->boolean('temporary_request'),
            'is_initial_order' => $this->boolean('is_initial_order'),

            'lipid_piggyback' => $this->boolean('lipid_piggyback'),
            'lipid_separate_line' => $this->boolean('lipid_separate_line'),

            'last_name' => $this->nullIfEmpty($this->input('last_name')),
            'first_name' => $this->nullIfEmpty($this->input('first_name')),
            'middle_name' => $this->nullIfEmpty($this->input('middle_name')),
            'suffix' => $this->nullIfEmpty($this->input('suffix')),

            'hospital_number' => $this->nullIfEmpty($this->input('hospital_number')),
            'date_of_birth' => $this->nullIfEmpty($this->input('date_of_birth')),
            'sex' => $this->nullIfEmpty($this->input('sex')),

            'ward' => $this->nullIfEmpty($this->input('ward')),
            'room' => $this->nullIfEmpty($this->input('room')),
            'prescribing_physician' => $this->nullIfEmpty($this->input('prescribing_physician')),

            'birth_weight_kg' => $this->nullIfEmpty($this->input('birth_weight_kg')),
            'current_weight_kg' => $this->nullIfEmpty($this->input('current_weight_kg')),
            'height_cm' => $this->nullIfEmpty($this->input('height_cm')),
            'diagnosis' => $this->nullIfEmpty($this->input('diagnosis')),

            'total_fluid_ml' => $this->nullIfEmpty($this->input('total_fluid_ml')),
            'duration_hours' => $this->nullIfEmpty($this->input('duration_hours')),
            'route' => $this->nullIfEmpty($this->input('route')),

            'protein_g_per_kg_day' => $this->nullIfEmpty($this->input('protein_g_per_kg_day')),
            'dextrose_percent' => $this->nullIfEmpty($this->input('dextrose_percent')),

            'lipid_g_per_kg_day' => $this->nullIfEmpty($this->input('lipid_g_per_kg_day')),
            'lipid_concentration' => $this->nullIfEmpty($this->input('lipid_concentration')),
            'lipid_duration_hours' => $this->nullIfEmpty($this->input('lipid_duration_hours')),

            'sodium_meq_kg_day' => $this->nullIfEmpty($this->input('sodium_meq_kg_day')),
            'potassium_meq_kg_day' => $this->nullIfEmpty($this->input('potassium_meq_kg_day')),
            'calcium_mg_kg_day' => $this->nullIfEmpty($this->input('calcium_mg_kg_day')),
            'magnesium_meq_kg_day' => $this->nullIfEmpty($this->input('magnesium_meq_kg_day')),
            'phosphorus_mmol_kg_day' => $this->nullIfEmpty($this->input('phosphorus_mmol_kg_day')),

            'trace_elements_ml_kg_day' => $this->nullIfEmpty($this->input('trace_elements_ml_kg_day')),
            'multivitamins_ml_day' => $this->nullIfEmpty($this->input('multivitamins_ml_day')),
            'heparin_ml' => $this->nullIfEmpty($this->input('heparin_ml')),
            'heparin_iu_per_ml' => $this->nullIfEmpty($this->input('heparin_iu_per_ml')),
            'sterile_water_level_ml_day' => $this->nullIfEmpty($this->input('sterile_water_level_ml_day', $this->input('sterile_water_ml_day'))),

            'osmolarity_notes' => $this->nullIfEmpty($this->input('osmolarity_notes')),
            'osmolarity_inputs_json' => $this->normalizeOsmolarityInputsJson(
                $this->input('osmolarity_inputs_json'),
            ),
            'osmolarity_computed_mosm_l' => $this->nullIfEmpty(
                $this->input('osmolarity_computed_mosm_l'),
            ),
        ]);
    }

    public function rules(): array
    {
        return [
            'temporary_request' => ['boolean'],

            'last_name' => ['required', 'string', 'max:100'],
            'first_name' => ['required', 'string', 'max:100'],
            'middle_name' => ['nullable', 'string', 'max:100'],
            'suffix' => ['nullable', 'string', 'max:30'],

            'hospital_number' => ['nullable', 'string', 'max:50'],
            'date_of_birth' => ['nullable', 'date'],
            'sex' => ['nullable', 'string', 'max:20'],

            'ward' => ['nullable', 'string', 'max:100'],
            'room' => ['nullable', 'string', 'max:100'],
            'prescribing_physician' => ['nullable', 'string', 'max:150'],
            'is_initial_order' => ['boolean'],

            'birth_weight_kg' => ['nullable', 'numeric', 'min:0'],
            'current_weight_kg' => ['required', 'numeric', 'min:0.01'],
            'height_cm' => ['nullable', 'numeric', 'min:0'],
            'diagnosis' => ['nullable', 'string'],

            'total_fluid_ml' => ['required', 'numeric', 'min:0.01'],
            'duration_hours' => ['required', 'numeric', 'min:0.01'],
            'route' => ['nullable', 'string', 'max:100'],

            'protein_g_per_kg_day' => ['nullable', 'numeric', 'min:0'],
            'dextrose_percent' => ['nullable', 'numeric', 'min:0'],

            'lipid_g_per_kg_day' => ['nullable', 'numeric', 'min:0'],
            'lipid_concentration' => [
                'nullable',
                'numeric',
                Rule::in([10, 20, '10', '20']),
            ],
            'lipid_duration_hours' => ['nullable', 'numeric', 'min:0'],
            'lipid_piggyback' => ['boolean'],
            'lipid_separate_line' => ['boolean'],

            'sodium_meq_kg_day' => ['nullable', 'numeric', 'min:0'],
            'potassium_meq_kg_day' => ['nullable', 'numeric', 'min:0'],
            'calcium_mg_kg_day' => ['nullable', 'numeric', 'min:0'],
            'magnesium_meq_kg_day' => ['nullable', 'numeric', 'min:0'],
            'phosphorus_mmol_kg_day' => ['nullable', 'numeric', 'min:0'],

            'trace_elements_ml_kg_day' => ['nullable', 'numeric', 'min:0'],
            'multivitamins_ml_day' => ['nullable', 'numeric', 'min:0'],
            'heparin_ml' => ['nullable', 'numeric', 'min:0'],
            'heparin_iu_per_ml' => ['nullable', 'numeric', 'min:0'],
            'sterile_water_level_ml_day' => ['nullable', 'numeric', 'min:0'],

            'osmolarity_notes' => ['nullable', 'string'],
            'osmolarity_inputs_json' => ['nullable', 'string'],
            'osmolarity_computed_mosm_l' => ['nullable', 'numeric', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'last_name.required' => 'Last name is required.',
            'first_name.required' => 'First name is required.',
            'current_weight_kg.required' => 'Current weight is required.',
            'current_weight_kg.min' => 'Current weight must be greater than zero.',
            'total_fluid_ml.required' => 'Total fluid is required.',
            'total_fluid_ml.min' => 'Total fluid must be greater than zero.',
            'duration_hours.required' => 'Duration is required.',
            'duration_hours.min' => 'Duration must be greater than zero.',
        ];
    }

    private function normalizeOsmolarityInputsJson(mixed $value): ?string
    {
        if ($value === null || $value === '') {
            return null;
        }

        if (is_array($value)) {
            return json_encode($value, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        }

        if (is_string($value)) {
            $trimmed = trim($value);

            if ($trimmed === '') {
                return null;
            }

            json_decode($trimmed);

            return json_last_error() === JSON_ERROR_NONE ? $trimmed : null;
        }

        return null;
    }

    private function nullIfEmpty(mixed $value): mixed
    {
        if (is_string($value) && trim($value) === '') {
            return null;
        }

        return $value;
    }
}
