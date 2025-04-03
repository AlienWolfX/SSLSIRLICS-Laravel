<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            {{ __('Add New Error Code') }}
        </h2>
    </x-slot>

    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                <div class="p-6 text-gray-900 dark:text-gray-100">
                    <form method="POST" action="{{ route('error-codes.store') }}" class="space-y-6">
                        @csrf

                        <div class="mb-6">
                            <div class="flex items-center justify-between">
                                <x-input-label for="error_code" value="Error Code" class="text-lg font-semibold"/>
                                <span class="text-sm text-gray-500 dark:text-gray-400">Unique Identifier</span>
                            </div>
                            <div class="mt-2">
                                <x-text-input
                                    id="error_code"
                                    name="error_code"
                                    type="text"
                                    class="mt-1 block w-full"
                                    required
                                    placeholder="Enter Error Code"
                                />
                                <x-input-error :messages="$errors->get('error_code')" class="mt-2" />
                            </div>
                        </div>

                        <div>
                            <x-input-label for="problem" value="Problem Description" />
                            <x-text-input
                                id="problem"
                                name="problem"
                                type="text"
                                class="mt-1 block w-full"
                                required
                                placeholder="Describe the problem"
                            />
                            <x-input-error :messages="$errors->get('problem')" class="mt-2" />
                        </div>

                        <div>
                            <x-input-label for="action" value="Recommended Action" />
                            <x-text-input
                                id="action"
                                name="action"
                                type="text"
                                class="mt-1 block w-full"
                                required
                                placeholder="Describe the recommended action"
                            />
                            <x-input-error :messages="$errors->get('action')" class="mt-2" />
                        </div>

                        <div class="flex items-center gap-4">
                            <x-primary-button>{{ __('Save') }}</x-primary-button>
                            <a href="{{ route('dashboard') }}"
                               class="inline-flex items-center px-4 py-2 bg-gray-800 border border-transparent
                                      rounded-md font-semibold text-xs text-white uppercase tracking-widest
                                      hover:bg-gray-700">
                                {{ __('Cancel') }}
                            </a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</x-app-layout>
