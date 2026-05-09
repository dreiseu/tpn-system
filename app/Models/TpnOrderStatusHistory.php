<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TpnOrderStatusHistory extends Model
{
    protected $table = 'tblTpnOrderStatusHistory';

    protected $primaryKey = 'history_id';

    public $timestamps = false;

    protected $fillable = [
        'tpn_order_id',

        'old_status',
        'new_status',

        'remarks',

        'changed_by',
        'changed_at',
    ];

    protected $casts = [
        'changed_at' => 'datetime',
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
