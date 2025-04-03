<?php

namespace App\Http\Controllers;

use App\Models\ErrorCode;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\View\View;

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
     * Show the form for creating a new error code.
     */
    public function create(): View
    {
        return view('error-codes.create');
    }

    /**
     * Store a newly created error code.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'error_code' => 'required|string|unique:error_codes',
            'problem' => 'required|string',
            'action' => 'required|string'
        ]);

        $validated['user_id'] = auth()->id();

        $errorCode = ErrorCode::create($validated);

        return redirect()->route('dashboard')
                        ->with('success', 'Error code created successfully.');
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
     * Show the form for editing the specified error code.
     */
    public function edit(string $code)
    {
        $errorCode = ErrorCode::findOrFail($code);
        return view('error-codes.edit', compact('errorCode'));
    }

    /**
     * Update the specified error code in storage.
     */
    public function update(Request $request, string $code)
    {
        $errorCode = ErrorCode::findOrFail($code);

        $validated = $request->validate([
            'error_code' => 'required|string|unique:error_codes,error_code,' . $code . ',error_code',
            'problem' => 'required|string',
            'action' => 'required|string'
        ]);

        $errorCode->update($validated);

        return redirect()->route('dashboard')
                        ->with('success', 'Error code updated successfully.');
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
