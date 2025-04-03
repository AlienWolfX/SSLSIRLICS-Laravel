<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DeviceController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ErrorCodeController;


// Guest

Route::get('/', function () {
    return view('index');
});


// Authenticated

Route::middleware('auth')->group(function () {
    Route::resource('devices', DeviceController::class);
});

Route::get('/error-codes', [ErrorCodeController::class, 'index'])->name('error-codes.index');
Route::post('/error-codes', [ErrorCodeController::class, 'store'])->name('error-codes.store');
Route::get('/error-codes/{code}', [ErrorCodeController::class, 'show'])->name('error-codes.show');
Route::put('/error-codes/{code}', [ErrorCodeController::class, 'update'])->name('error-codes.update');
Route::delete('/error-codes/{code}', [ErrorCodeController::class, 'destroy'])->name('error-codes.destroy');

Route::get('/dashboard', [DeviceController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
