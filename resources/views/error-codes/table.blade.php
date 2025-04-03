<div class="relative overflow-x-auto shadow-md sm:rounded-lg">
    <!-- Table Header with Search and Add Button -->
    <div class="p-4 bg-white dark:bg-gray-900 flex justify-between items-center">
        <div class="relative">
        </div>
        <button onclick="openAddErrorCodeModal()" class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300">
            <i class="fas fa-plus mr-2"></i> Add Error Code
        </button>
    </div>

    <!-- Table -->
    <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
                <th scope="col" class="px-6 py-3">Error Code</th>
                <th scope="col" class="px-6 py-3">Problem</th>
                <th scope="col" class="px-6 py-3">Action</th>
                <th scope="col" class="px-6 py-3 text-right">Manage</th>
            </tr>
        </thead>
        <tbody>
            @forelse($errorCodes as $errorCode)
                <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-grayishBlue dark:hover:bg-gray-600">
                    <td class="px-6 py-4 font-medium">{{ $errorCode->error_code }}</td>
                    <td class="px-6 py-4">{{ $errorCode->problem }}</td>
                    <td class="px-6 py-4">{{ $errorCode->action }}</td>
                    <td class="px-6 py-4 text-right space-x-2">
                        <button onclick="openEditErrorCodeModal('{{ $errorCode->error_code }}')" class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-600">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="deleteErrorCode('{{ $errorCode->error_code }}')" class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-600">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            @empty
                <tr class="bg-white dark:bg-gray-800">
                    <td colspan="4" class="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                        No error codes found
                    </td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <!-- Pagination -->
    <div class="p-4">
        @if($errorCodes instanceof \Illuminate\Pagination\LengthAwarePaginator)
            {{ $errorCodes->links() }}
        @endif
    </div>
</div>
