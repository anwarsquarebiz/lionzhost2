<?php

use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\TwoFactorAuthenticationController;
use App\Http\Controllers\Settings\ContactController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware('auth')->group(function () {
    Route::redirect('settings', '/settings/profile');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('settings/password', [PasswordController::class, 'edit'])->name('password.edit');

    Route::put('settings/password', [PasswordController::class, 'update'])
        ->middleware('throttle:6,1')
        ->name('password.update');

    Route::get('settings/appearance', function () {
        return Inertia::render('settings/appearance');
    })->name('appearance.edit');

    Route::get('settings/two-factor', [TwoFactorAuthenticationController::class, 'show'])
        ->name('two-factor.show');

    // Contacts management
    Route::get('settings/contacts', [ContactController::class, 'index'])->name('contacts.index');
    Route::post('settings/contacts', [ContactController::class, 'store'])->name('contacts.store');
    Route::put('settings/contacts/{contact}', [ContactController::class, 'update'])->name('contacts.update');
    Route::delete('settings/contacts/{contact}', [ContactController::class, 'destroy'])->name('contacts.destroy');
    Route::put('settings/contacts/{contact}/default', [ContactController::class, 'setDefault'])->name('contacts.default');
});
