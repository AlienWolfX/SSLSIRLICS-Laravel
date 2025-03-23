<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            {{ __('Add New Device') }}
        </h2>
    </x-slot>

    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                <div class="p-6 text-gray-900 dark:text-gray-100">
                    <form method="POST" action="{{ route('devices.store') }}" class="space-y-6">
                        @csrf
                        
                        <div>
                            <x-input-label for="SOCid" value="SOC ID" />
                            <x-text-input id="SOCid" name="SOCid" type="text" class="mt-1 block w-full" required />
                            <x-input-error :messages="$errors->get('SOCid')" class="mt-2" />
                        </div>

                        <div>
                            <x-input-label for="SOCadd" value="Address" />
                            <x-text-input id="SOCadd" name="SOCadd" type="text" class="mt-1 block w-full" required />
                            <x-input-error :messages="$errors->get('SOCadd')" class="mt-2" />
                        </div>

                        <div>
                            <x-input-label for="date_installed" value="Date Installed" />
                            <x-text-input 
                                id="date_installed" 
                                name="date_installed" 
                                type="date" 
                                class="mt-1 block w-full" 
                                value="{{ now()->format('Y-m-d') }}"
                                required 
                            />
                            <x-input-error :messages="$errors->get('date_installed')" class="mt-2" />
                        </div>

                        <div>
                            <x-input-label for="status" value="Status" />
                            <select 
                                id="status" 
                                name="status" 
                                class="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                            >
                                <option value="active" selected>Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="maintenance">Maintenance</option>
                            </select>
                            <x-input-error :messages="$errors->get('status')" class="mt-2" />
                        </div>

                        <div>
                            <x-input-label for="lat" value="Latitude" />
                            <x-text-input id="lat" name="lat" type="number" step="0.00000001" class="mt-1 block w-full" required />
                            <x-input-error :messages="$errors->get('lat')" class="mt-2" />
                        </div>

                        <div>
                            <x-input-label for="long" value="Longitude" />
                            <x-text-input id="long" name="long" type="number" step="0.00000001" class="mt-1 block w-full" required />
                            <x-input-error :messages="$errors->get('long')" class="mt-2" />
                        </div>

                        <div class="flex items-center gap-4">
                            <x-primary-button>{{ __('Save') }}</x-primary-button>
                            <a href="{{ route('dashboard') }}" class="inline-flex items-center px-4 py-2 bg-gray-800 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700">
                                {{ __('Cancel') }}
                            </a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</x-app-layout>