<?php

use App\Http\Controllers\Api\DeviceReadingController;
use App\Http\Controllers\DeviceController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');


Route::prefix('v1')->group(function () {
    Route::get('/readings', [DeviceReadingController::class, 'index']);
    Route::get('/readings/{socid}', [DeviceReadingController::class, 'show']);

    Route::get('/province_count/{province}', [DeviceController::class, 'province_count']);
});
