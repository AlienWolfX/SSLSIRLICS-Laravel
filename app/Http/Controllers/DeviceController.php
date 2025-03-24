<?php

namespace App\Http\Controllers;

use App\Models\Device;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class DeviceController extends Controller
{
    public function index()
    {
        $devices = Device::latest()->paginate(10);
        return view('dashboard', compact('devices'));
    }

    public function getAllDevice(): JsonResponse
    {
        try {
            $devices = Device::all(['SOCid', 'lat', 'long']);

            return response()->json([
                'status' => 'success',
                'data' => $devices,
                'message' => 'Devices retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve devices',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function create()
    {
        return view('devices.create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'SOCid' => 'required|unique:devices,SOCid',
            'SOCadd' => 'required',
            'date_installed' => 'required|date',
            'status' => 'required|in:active,inactive,maintenance',
            'lat' => 'required|numeric|between:-90,90',
            'long' => 'required|numeric|between:-180,180',
        ]);

        Device::create($validated);

        return redirect()->route('dashboard')
            ->with('success', 'Device has been successfully created!');
    }

    public function delete(Device $device)
    {
        $device->delete();

        return redirect()->route('dashboard')
            ->with('success', 'Device has been successfully removed!');
    }

    public function destroy(Device $device)
    {
        try {
            $device->delete();
            return redirect()->route('dashboard')
                ->with('success', 'Device has been successfully deleted!');
        } catch (\Exception $e) {
            return redirect()->route('dashboard')
                ->with('error', 'Unable to delete device. Please try again.');
        }
    }

    public function edit(Device $device)
    {
        return view('devices.edit', compact('device'));
    }

    public function update(Request $request, Device $device)
    {
        $validated = $request->validate([
            'SOCid' => 'required|unique:devices,SOCid,' . $device->id,
            'SOCadd' => 'required',
            'date_installed' => 'required|date',
            'status' => 'required|in:active,inactive,maintenance',
            'lat' => 'required|numeric|between:-90,90',
            'long' => 'required|numeric|between:-180,180',
        ]);

        $device->update($validated);

        return redirect()->route('dashboard')
            ->with('success', 'Device has been successfully updated!');
    }

    public function province_count(string $province): JsonResponse
    {
        $count = Device::query()
            ->where('SOCid', 'LIKE', $province . '-%')
            ->count();

        $statusCounts = Device::query()
            ->where('SOCid', 'LIKE', $province . '-%')
            ->selectRaw('
                status,
                COUNT(*) as count,
                ROUND((COUNT(*) / ?) * 100, 2) as percentage
            ', [$count])
            ->groupBy('status')
            ->get()
            ->keyBy('status');

        $hasActive = isset($statusCounts['active']) && $statusCounts['active']->count > 0;
        $hasInactive = isset($statusCounts['inactive']) && $statusCounts['inactive']->count > 0;
        $hasMaintenance = isset($statusCounts['maintenance']) && $statusCounts['maintenance']->count > 0;

        return response()->json([
            'status' => 'success',
            'data' => [
                'province_code' => strtoupper($province),
                'total_devices' => $count,
                'status_summary' => [
                    // 'has_active' => $hasActive,
                    'has_inactive' => $hasInactive,
                    'has_maintenance' => $hasMaintenance,
                ]
            ]
        ]);
    }

    public function municipality_count(string $province, string $municipality): JsonResponse
    {
        $pattern = $province . '-' . $municipality . '-%';

        // Get total count
        $count = Device::query()
            ->where('SOCid', 'LIKE', $pattern)
            ->count();

        // Get status counts
        $statusCounts = Device::query()
            ->where('SOCid', 'LIKE', $pattern)
            ->selectRaw('
                status,
                COUNT(*) as count,
                ROUND((COUNT(*) / ?) * 100, 2) as percentage
            ', [$count])
            ->groupBy('status')
            ->get()
            ->keyBy('status');

        // Check if each status exists
        $hasActive = isset($statusCounts['active']) && $statusCounts['active']->count > 0;
        $hasInactive = isset($statusCounts['inactive']) && $statusCounts['inactive']->count > 0;
        $hasMaintenance = isset($statusCounts['maintenance']) && $statusCounts['maintenance']->count > 0;

        return response()->json([
            'status' => 'success',
            'data' => [
                'province_code' => strtoupper($province),
                'municipality_code' => strtoupper($municipality),
                'total_devices' => $count,
                'status_summary' => [
                    // 'has_active' => $hasActive,
                    'has_inactive' => $hasInactive,
                    'has_maintenance' => $hasMaintenance,
                ]
            ]
        ]);
    }

    public function barangay_count(string $province, string $municipality, string $barangay): JsonResponse
    {
        $pattern = $province . '-' . $municipality . '-' . $barangay;

        // Get total count
        $count = Device::query()
            ->where('SOCid', 'LIKE', $pattern . '%')
            ->count();

        // Get status counts
        $statusCounts = Device::query()
            ->where('SOCid', 'LIKE', $pattern . '%')
            ->selectRaw('
                status,
                COUNT(*) as count,
                ROUND((COUNT(*) / ?) * 100, 2) as percentage
            ', [$count])
            ->groupBy('status')
            ->get()
            ->keyBy('status');

        $hasActive = isset($statusCounts['active']) && $statusCounts['active']->count > 0;
        $hasInactive = isset($statusCounts['inactive']) && $statusCounts['inactive']->count > 0;
        $hasMaintenance = isset($statusCounts['maintenance']) && $statusCounts['maintenance']->count > 0;

        $devices = Device::query()
            ->where('SOCid', 'LIKE', $pattern . '%')
            ->select('SOCid', 'SOCadd', 'status', 'date_installed')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => [
                'province_code' => strtoupper($province),
                'municipality_code' => strtoupper($municipality),
                'barangay_code' => strtoupper($barangay),
                'total_devices' => $count,
                'status_summary' => [
                    // 'has_active' => $hasActive,
                    'has_inactive' => $hasInactive,
                    'has_maintenance' => $hasMaintenance,
                ],
            ]
        ]);
    }
}
