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

        return response()->json([
            'status' => 'success',
            'data' => [
                'province_code' => strtoupper($province),
                'total_devices' => $count,
            ],
        ]);
    }

    public function municipality_count(string $province, string $municipality): JsonResponse
    {
        $pattern = $province . '-' . $municipality . '-%';

        $count = Device::query()
            ->where('SOCid', 'LIKE', $pattern)
            ->count();

        $devices = Device::query()
            ->where('SOCid', 'LIKE', $pattern)
            ->select('SOCid', 'SOCadd', 'status', 'date_installed')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => [
                'province_code' => strtoupper($province),
                'municipality_code' => strtoupper($municipality),
                'total_devices' => $count,
            ],
        ]);
    }

    public function barangay_count(string $province, string $municipality, string $barangay): JsonResponse
    {
        $pattern = $province . '-' . $municipality . '-' . $barangay;

        $count = Device::query()
            ->where('SOCid', 'LIKE', $pattern . '%')
            ->count();

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
            ],
        ]);
    }
}
