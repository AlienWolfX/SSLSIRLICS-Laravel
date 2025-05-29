<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            {{ __('Profile') }}
        </h2>
    </x-slot>

    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
            <div class="p-4 sm:p-8 bg-white dark:bg-gray-800 shadow sm:rounded-lg">
                <div class="max-w-xl">
                    @include('profile.partials.update-profile-information-form')
                </div>
            </div>

            <div class="p-4 sm:p-8 bg-white dark:bg-gray-800 shadow sm:rounded-lg">
                <div class="max-w-xl">
                    @include('profile.partials.update-password-form')
                </div>
            </div>

            {{-- Access Management --}}
            <div class="p-4 sm:p-8 bg-white dark:bg-gray-800 shadow sm:rounded-lg">
                <div class="max-w-xl">
                    <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Access Management</h3>
                    @php
                        $userTokens = Auth::user()->tokens;
                    @endphp
                    @if(session('token'))
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Your New API Token:</label>
                            <div class="bg-gray-100 dark:bg-gray-700 rounded p-2 break-all select-all">
                                {{ session('token') }}
                            </div>
                        </div>
                    @elseif($userTokens->count())
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Your Existing API Token(s):</label>
                            @foreach($userTokens as $token)
                                <div class="bg-gray-100 dark:bg-gray-700 rounded p-2 mb-2 break-all select-all">
                                    <span class="font-mono">{{ $token->name }}</span>
                                    <span class="text-xs text-gray-500 dark:text-gray-400">(created {{ $token->created_at->diffForHumans() }})</span>
                                    {{-- Only show plainTextToken on creation, so show token id here --}}
                                    <div class="text-xs text-gray-400">Token ID: {{ $token->id }}</div>
                                </div>
                            @endforeach
                        </div>
                    @endif
                    <form method="POST" action="{{ route('profile.create-token') }}">
                        @csrf
                        <div class="mb-4">
                            <label for="token_name" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Token Name</label>
                            <input id="token_name" name="token_name" type="text" required class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-900 dark:text-gray-100" />
                        </div>
                        <button type="submit" class="inline-flex items-center px-4 py-2 bg-indigo-600 dark:bg-indigo-500 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 dark:hover:bg-indigo-600 focus:outline-none focus:border-indigo-700 focus:ring ring-indigo-300 dark:ring-indigo-500 disabled:opacity-25 transition ease-in-out duration-150">
                            Generate API Token
                        </button>
                    </form>
                </div>
            </div>
            {{-- End Access Management --}}

            <div class="p-4 sm:p-8 bg-white dark:bg-gray-800 shadow sm:rounded-lg">
                <div class="max-w-xl">
                    @include('profile.partials.delete-user-form')
                </div>
            </div>
        </div>
    </div>
</x-app-layout>
