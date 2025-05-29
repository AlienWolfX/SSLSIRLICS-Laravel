<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DeviceReading;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class DeviceReadingController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = DeviceReading::query()->with('device');


        if ($request->has('socid')) {
            $query->where('SOCid', $request->socid);
        }


        if ($request->has('from')) {
            $query->where('date', '>=', $request->from);
        }
        if ($request->has('to')) {
            $query->where('date', '<=', $request->to);
        }


        $readings = $query->latest('date')
            ->paginate($request->per_page ?? 15);

        return response()->json([
            'status' => 'success',
            'data' => $readings,
            'message' => 'Device readings retrieved successfully'
        ]);
    }

    /**
     * Get readings for a specific device
     *
     * @param string $socid
     * @return JsonResponse
     */
    public function show(string $socid): JsonResponse
    {
        $latestReading = DeviceReading::where('SOCid', $socid)
            ->with('device')
            ->latest('date')
            ->first();

        if (!$latestReading) {
            return response()->json([
                'status' => 'error',
                'message' => 'No readings found for this device'
            ], 404);
        }

        $historicalData = DeviceReading::where('SOCid', $socid)
            ->where('date', '>=', now()->subHours(24))
            ->orderBy('date')
            ->get()
            ->map(function ($reading) {
                return [
                    'id' => $reading->id,
                    'SOCid' => $reading->SOCid,
                    'bulbv' => $reading->bulbv,
                    'bulbc' => $reading->bulbc,
                    'solv' => $reading->solv,
                    'solc' => $reading->solc,
                    'batv' => $reading->batv,
                    'batc' => $reading->batc,
                    'batsoc' => $reading->batsoc,
                    'date' => $reading->date->format('Y-m-d\TH:i:s.u\Z'),
                ];
            });

        return response()->json([
            'status' => 'success',
            'latest_reading' => $latestReading,
            'historical_data' => $historicalData,
            'message' => 'Device readings retrieved successfully'
        ]);
    }

    /**
     * Store a new device reading via API (requires Sanctum token).
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        // Ensure the request is authenticated via Sanctum
        $user = Auth::guard('sanctum')->user();
        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized. Valid API token required.'
            ], 401);
        }

        try {
            $validated = $request->validate([
                'SOCid'   => 'required|string',
                'bulbv'   => 'required|numeric',
                'bulbc'   => 'required|numeric',
                'solv'    => 'required|numeric',
                'solc'    => 'required|numeric',
                'batv'    => 'required|numeric',
                'batc'    => 'required|numeric',
                'batsoc'  => 'required|numeric',
                'date'    => 'required|date',
            ]);

            $reading = DeviceReading::create($validated);

            return response()->json([
                'status' => 'success',
                'data' => $reading,
                'message' => 'Device reading stored successfully'
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed.',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to store device reading.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
