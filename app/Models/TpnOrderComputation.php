<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TpnOrderComputation extends Model
{
    protected $table = 'tblTpnOrderComputations';

    protected $primaryKey = 'computation_id';

    public $timestamps = false;

    protected $fillable = [
        'tpn_order_id',

        'protein_g_per_kg_day',

        'dextrose_percent',

        'lipid_g_per_kg_day',
        'lipid_concentration',
        'lipid_duration_hours',
        'lipid_piggyback',
        'lipid_separate_line',

        'sodium_meq_kg_day',
        'potassium_meq_kg_day',
        'calcium_mg_kg_day',
        'magnesium_meq_kg_day',
        'phosphorus_mmol_kg_day',

        'trace_elements_ml_kg_day',
        'multivitamins_ml_day',
        'heparin_ml',
        'heparin_iu_per_ml',
        'sterile_water_level_ml_day',

        'osmolarity_notes',
        'osmolarity_inputs_json',
        'osmolarity_computed_mosm_l',

        'date_created',
        'date_modified',
    ];

    protected $casts = [
        'protein_g_per_kg_day' => 'decimal:2',

        'dextrose_percent' => 'decimal:2',

        'lipid_g_per_kg_day' => 'decimal:2',
        'lipid_concentration' => 'decimal:2',
        'lipid_duration_hours' => 'decimal:2',
        'lipid_piggyback' => 'boolean',
        'lipid_separate_line' => 'boolean',

        'sodium_meq_kg_day' => 'decimal:2',
        'potassium_meq_kg_day' => 'decimal:2',
        'calcium_mg_kg_day' => 'decimal:2',
        'magnesium_meq_kg_day' => 'decimal:2',
        'phosphorus_mmol_kg_day' => 'decimal:2',

        'trace_elements_ml_kg_day' => 'decimal:2',
        'multivitamins_ml_day' => 'decimal:2',
        'heparin_ml' => 'decimal:2',
        'heparin_iu_per_ml' => 'decimal:2',
        'sterile_water_level_ml_day' => 'decimal:2',
        'osmolarity_computed_mosm_l' => 'decimal:2',

        'date_created' => 'datetime',
        'date_modified' => 'datetime',
    ];

    public function order()
    {
        return $this->belongsTo(
            TpnOrder::class,
            'tpn_order_id',
            'tpn_order_id',
        );
    }
}
