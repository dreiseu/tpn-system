<?php
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\TpnOrder;

$orders = TpnOrder::orderByDesc('tpn_order_id')->limit(5)->get();

foreach ($orders as $order) {
    echo $order->first_name . " " . $order->last_name . "\n";
}
