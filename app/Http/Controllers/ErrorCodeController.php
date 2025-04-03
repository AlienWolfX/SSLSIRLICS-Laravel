<?php

namespace App\Http\Controllers;

use App\Models\ErrorCode;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ErrorCodeController extends Controller
{
    /**
     * Display a listing of error codes.
     */
    public function index()
    {
        $errorCodes = ErrorCode::orderBy('error_code')->paginate(10);
        if (request()->ajax()) {
            return response()->json($errorCodes);
        }
        return view('error-codes.index', compact('errorCodes'));
    }

    /**
     * Store a newly created error code.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'error_code' => 'required|string|unique:error_codes',
            'problem' => 'required|string',
            'action' => 'required|string'
        ]);

        $errorCode = ErrorCode::create($validated);
        return response()->json(['data' => $errorCode], 201);
    }

    /**
     * Display the specified error code.
     */
    public function show(string $code): JsonResponse
    {
        $errorCode = ErrorCode::findOrFail($code);
        return response()->json(['data' => $errorCode]);
    }

    /**
     * Update the specified error code.
     */
    public function update(Request $request, string $code): JsonResponse
    {
        $errorCode = ErrorCode::findOrFail($code);

        $validated = $request->validate([
            'problem' => 'string',
            'action' => 'string'
        ]);

        $errorCode->update($validated);
        return response()->json(['data' => $errorCode]);
    }

    /**
     * Remove the specified error code.
     */
    public function destroy(string $code): JsonResponse
    {
        $errorCode = ErrorCode::findOrFail($code);
        $errorCode->delete();
        return response()->json([], 204);
    }
}
