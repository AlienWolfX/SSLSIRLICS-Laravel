<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            {{ __('Edit Device') }}
        </h2>
    </x-slot>

    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                <div class="p-6 text-gray-900 dark:text-gray-100">
                    <form method="POST" action="{{ route('devices.update', $device) }}" class="space-y-6">
                        @csrf
                        @method('PUT')

                        <!-- SOC ID -->
                        <div>
                            <x-input-label for="SOCid" value="SOC ID" />
                            <x-text-input id="SOCid" name="SOCid" type="text" 
                                class="mt-1 block w-full" 
                                value="{{ old('SOCid', $device->SOCid) }}" 
                                required />
                            <x-input-error :messages="$errors->get('SOCid')" class="mt-2" />
                        </div>

                        <!-- Address -->
                        <div>
                            <x-input-label for="SOCadd" value="Address" />
                            <x-text-input id="SOCadd" name="SOCadd" type="text" 
                                class="mt-1 block w-full" 
                                value="{{ old('SOCadd', $device->SOCadd) }}" 
                                required />
                            <x-input-error :messages="$errors->get('SOCadd')" class="mt-2" />
                        </div>

                        <!-- Date Installed -->
                        <div>
                            <x-input-label for="date_installed" value="Date Installed" />
                            <x-text-input id="date_installed" name="date_installed" type="date" 
                                class="mt-1 block w-full" 
                                value="{{ old('date_installed', $device->date_installed->format('Y-m-d')) }}" 
                                required />
                            <x-input-error :messages="$errors->get('date_installed')" class="mt-2" />
                        </div>

                        <!-- Status -->
                        <div>
                            <x-input-label for="status" value="Status" />
                            <select id="status" name="status" 
                                class="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm">
                                <option value="active" {{ old('status', $device->status) === 'active' ? 'selected' : '' }}>Active</option>
                                <option value="inactive" {{ old('status', $device->status) === 'inactive' ? 'selected' : '' }}>Inactive</option>
                                <option value="maintenance" {{ old('status', $device->status) === 'maintenance' ? 'selected' : '' }}>Maintenance</option>
                            </select>
                            <x-input-error :messages="$errors->get('status')" class="mt-2" />
                        </div>

                        <!-- Coordinates -->
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <x-input-label for="lat" value="Latitude" />
                                <x-text-input id="lat" name="lat" type="number" step="0.00000001"
                                    class="mt-1 block w-full" 
                                    value="{{ old('lat', $device->lat) }}" 
                                    required />
                                <x-input-error :messages="$errors->get('lat')" class="mt-2" />
                            </div>
                            <div>
                                <x-input-label for="long" value="Longitude" />
                                <x-text-input id="long" name="long" type="number" step="0.00000001"
                                    class="mt-1 block w-full" 
                                    value="{{ old('long', $device->long) }}" 
                                    required />
                                <x-input-error :messages="$errors->get('long')" class="mt-2" />
                            </div>
                        </div>

                        <!-- Buttons -->
                        <div class="flex items-center justify-end gap-4">
                            <a href="{{ route('dashboard') }}" 
                                class="inline-flex items-center px-4 py-2 bg-gray-800 dark:bg-gray-200 border border-transparent rounded-md font-semibold text-xs text-white dark:text-gray-800 uppercase tracking-widest hover:bg-gray-700 dark:hover:bg-white focus:bg-gray-700 dark:focus:bg-white active:bg-gray-900 dark:active:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition ease-in-out duration-150">
                                Cancel
                            </a>
                            <x-primary-button>Save Changes</x-primary-button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</x-app-layout>