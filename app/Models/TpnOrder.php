<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TpnOrder extends Model
{
    protected $table = 'tblTpnOrders';

    protected $primaryKey = 'tpn_order_id';

    public $timestamps = false;

    protected $fillable = [
        'order_no',
        'status',

        'temporary_request',

        'last_name',
        'first_name',
        'middle_name',
        'suffix',

        'hospital_number',
        'date_of_birth',
        'sex',

        'ward',
        'room',
        'prescribing_physician',
        'is_initial_order',

        'birth_weight_kg',
        'current_weight_kg',
        'diagnosis',

        'total_fluid_req_ml_kg_day',
        'total_fluid_ml',
        'total_fluid_with_overfill_ml',
        'duration_hours',
        'route',

        'created_by',
        'modified_by',
        'date_created',
        'date_modified',
    ];

    protected $casts = [
        'temporary_request' => 'boolean',
        'is_initial_order' => 'boolean',

        'date_of_birth' => 'date:Y-m-d',

        'birth_weight_kg' => 'decimal:3',
        'current_weight_kg' => 'decimal:3',

        'total_fluid_req_ml_kg_day' => 'decimal:2',
        'total_fluid_ml' => 'decimal:2',
        'total_fluid_with_overfill_ml' => 'decimal:2',
        'duration_hours' => 'decimal:2',

        'date_created' => 'datetime',
        'date_modified' => 'datetime',
    ];

    public function computation()
    {
        return $this->hasOne(
            TpnOrderComputation::class,
            'tpn_order_id',
            'tpn_order_id',
        );
    }

    public function statusHistory()
    {
        return $this->hasMany(
            TpnOrderStatusHistory::class,
            'tpn_order_id',
            'tpn_order_id',
        );
    }
}
