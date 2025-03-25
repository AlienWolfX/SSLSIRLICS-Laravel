<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DeviceReading;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

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
}
