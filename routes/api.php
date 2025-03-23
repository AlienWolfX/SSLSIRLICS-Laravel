<?php

use App\Http\Controllers\StreetlightController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');


// StreetlightController.php

Route::get('/streetlights', [StreetlightController::class, 'index']);
