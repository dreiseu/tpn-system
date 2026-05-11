<?php

use App\Http\Controllers\TpnOrderController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [TpnOrderController::class, 'dashboard'])
        ->name('dashboard');

    Route::get('orders', [TpnOrderController::class, 'index'])
        ->name('orders.index');

    Route::inertia('orders/register', 'orders/register')
        ->name('orders.register');

    Route::post('orders', [TpnOrderController::class, 'store'])
        ->name('orders.store');

    Route::put('orders/{order}', [TpnOrderController::class, 'update'])
        ->name('orders.update');

    Route::get('orders/{order}', [TpnOrderController::class, 'show'])
        ->name('orders.show');

    Route::get('orders/{order}/edit', [TpnOrderController::class, 'edit'])
        ->name('orders.edit');
});

require __DIR__ . '/settings.php';
