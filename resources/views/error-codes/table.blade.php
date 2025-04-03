<div class="relative overflow-hidden shadow-md sm:rounded-lg">
    <!-- Table Header with Search and Add Button -->
    <div class="p-4 bg-white dark:bg-gray-900 flex justify-between items-center">
        <div class="relative">
            <input type="text"
                   id="error-code-search"
                   class="block p-2 pl-10 text-sm border rounded-lg w-80
                          bg-gray-50 border-gray-300 dark:bg-gray-700
                          dark:border-gray-600 dark:text-white
                          focus:ring-blue-500 focus:border-blue-500"
                   placeholder="Search error codes..."
                   onkeyup="searchErrorCodes(this.value)">
        </div>
        <a href="{{ route('error-codes.create') }}"
           class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg
                  hover:bg-blue-700 focus:ring-4 focus:ring-blue-300">
            <i class="fas fa-plus mr-2"></i> Add Error Code
        </a>
    </div>

    <div class="overflow-x-auto" style="max-height: 70vh;">
        <table id="error-codes-table" class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
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
                            <a href="{{ route('error-codes.edit', $errorCode->error_code) }}"
                               class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-600">
                                <i class="fas fa-edit"></i>
                            </a>
                            <form action="{{ route('error-codes.destroy', $errorCode->error_code) }}"
                                  method="POST"
                                  class="inline-block"
                                  onsubmit="return confirm('Are you sure you want to delete this error code?');">
                                @csrf
                                @method('DELETE')
                                <button type="submit"
                                        class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-600">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </form>
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
    </div>

    <!-- Pagination -->
    <div class="p-4">
        @if($errorCodes instanceof \Illuminate\Pagination\LengthAwarePaginator)
            {{ $errorCodes->links() }}
        @endif
    </div>
</div>
