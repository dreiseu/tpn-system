<?php

use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    Route::inertia('tpn/orders', 'tpn/orders/index')
        ->name('tpn.orders.index');

    Route::inertia('tpn/orders/{order}', 'tpn/orders/show')
        ->name('tpn.orders.show');
});

require __DIR__.'/settings.php';
