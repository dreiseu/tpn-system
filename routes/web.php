<?php

use App\Http\Controllers\TpnOrderController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

// Ends the session when the browser tab is closed (called via sendBeacon)
Route::post('/session-end', function () {
    Auth::logout();
    request()->session()->invalidate();
    request()->session()->regenerateToken();
    return response()->noContent();
})->middleware('web')->name('session.end');

Route::redirect('/', '/login')->name('home');

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

    Route::delete('orders/{order}', [TpnOrderController::class, 'destroy'])
        ->name('orders.destroy');

    Route::patch('orders/{order}/status', [TpnOrderController::class, 'updateStatus'])
        ->name('orders.update-status');

    Route::get('orders/{order}', [TpnOrderController::class, 'show'])
        ->name('orders.show');

    Route::get('orders/{order}/edit', [TpnOrderController::class, 'edit'])
        ->name('orders.edit');

    Route::get('labels/tpn', [TpnOrderController::class, 'tpnLabel'])
        ->name('labels.tpn');

    Route::get('labels/lipids', [TpnOrderController::class, 'lipidsLabel'])
        ->name('labels.lipids');

    // Profile Settings
    Route::get('settings/profile', [\App\Http\Controllers\Settings\ProfileController::class, 'edit'])
        ->name('profile.edit');
    Route::patch('settings/profile', [\App\Http\Controllers\Settings\ProfileController::class, 'update'])
        ->name('profile.update');
    Route::delete('settings/profile', [\App\Http\Controllers\Settings\ProfileController::class, 'destroy'])
        ->name('profile.destroy');
});

