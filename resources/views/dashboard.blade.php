<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            {{ __('SSLSIRLICS Admin Dashboard') }}
        </h2>
    </x-slot>

    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                <div class="p-6 text-gray-900 dark:text-gray-100">
                    <h3 class="text-lg font-semibold mb-4">Welcome {{ Auth::user()->name }}!</h3>
                    <!-- Success/Error Notifications -->
                    <div class="fixed top-4 inset-x-0 flex justify-center z-50" id="notification-container">
                        @if (session('success'))
                            <div class="max-w-xs bg-green-100 border-l-4 border-green-500 text-green-700 p-3 rounded shadow-lg" 
                                role="alert"
                                x-data="{ show: true }"
                                x-show="show"
                                x-init="setTimeout(() => show = false, 3000)">
                                <div class="flex items-center text-sm">
                                    <i class="fas fa-check-circle mr-2"></i>
                                    <span>{{ session('success') }}</span>
                                </div>
                            </div>
                        @endif

                        @if (session('error'))
                            <div class="max-w-xs bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded shadow-lg"
                                role="alert"
                                x-data="{ show: true }"
                                x-show="show"
                                x-init="setTimeout(() => show = false, 3000)">
                                <div class="flex items-center text-sm">
                                    <i class="fas fa-exclamation-circle mr-2"></i>
                                    <span>{{ session('error') }}</span>
                                </div>
                            </div>
                        @endif
                    </div>
                    @include('devices.table')
                </div>
            </div>
        </div>
    </div>
</x-app-layout>
