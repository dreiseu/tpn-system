<?php
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\TpnOrder;

$order = TpnOrder::where('first_name', 'F')->where('last_name', 'Test')->with('computation')->first();

if ($order) {
    echo json_encode($order->toArray(), JSON_PRETTY_PRINT);
} else {
    echo "Order not found";
}
