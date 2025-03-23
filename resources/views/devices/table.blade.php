<div class="relative overflow-x-auto shadow-md sm:rounded-lg">
    <!-- Table Header with Search and Add Button -->
    <div class="p-4 bg-white dark:bg-gray-900 flex justify-between items-center">
        <div class="relative">
            <input type="text"
                   id="table-search"
                   class="block p-2 pl-10 text-sm border rounded-lg w-80
                          bg-gray-50 border-gray-300 dark:bg-gray-700
                          dark:border-gray-600 dark:text-white
                          focus:ring-blue-500 focus:border-blue-500"
                   placeholder="Search devices..."
                   onkeyup="searchDevices(this.value)">
        </div>
        <a href="{{ route('devices.create') }}" class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300">
            <i class="fas fa-plus mr-2"></i> Add Device
        </a>
    </div>

    <!-- Table -->
    <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
                <th scope="col" class="px-6 py-3">SOC ID</th>
                <th scope="col" class="px-6 py-3">Address</th>
                <th scope="col" class="px-6 py-3">Date Installed</th>
                <th scope="col" class="px-6 py-3">Status</th>
                <th scope="col" class="px-6 py-3">Latitude</th>
                <th scope="col" class="px-6 py-3">Longitude</th>
                <th scope="col" class="px-6 py-3">Actions</th>
            </tr>
        </thead>
        <tbody>
            @forelse($devices as $device)
                <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                    <td class="px-6 py-4 font-medium">{{ $device->SOCid }}</td>
                    <td class="px-6 py-4">{{ $device->SOCadd }}</td>
                    <td class="px-6 py-4">{{ $device->date_installed->format('M d, Y') }}</td>
                    <td class="px-6 py-4">
                        <span class="px-2 py-1 text-xs font-semibold rounded-full
                            @if($device->status === 'active') bg-green-100 text-green-800
                            @elseif($device->status === 'inactive') bg-red-100 text-red-800
                            @else bg-yellow-100 text-yellow-800
                            @endif">
                            {{ ucfirst($device->status) }}
                        </span>
                    </td>
                    <td class="px-6 py-4">{{ number_format($device->lat, 8) }}</td>
                    <td class="px-6 py-4">{{ number_format($device->long, 8) }}</td>
                    <td class="px-6 py-4 space-x-2">
                        <a href="{{ route('devices.edit', $device) }}" class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-600">
                            <i class="fas fa-edit"></i>
                        </a>
                        <button onclick="deleteDevice('{{ $device->id }}')" class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-600">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            @empty
                <tr class="bg-white dark:bg-gray-800">
                    <td colspan="7" class="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                        No devices found
                    </td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <!-- Pagination -->
    <div class="p-4">
        {{ $devices->links() }}
    </div>
</div>

<!-- Delete Confirmation Modal -->
<div id="deleteModal" class="fixed inset-0 z-50 hidden overflow-y-auto bg-black/50 backdrop-blur-md transition-opacity duration-300">
    <div class="flex items-center justify-center min-h-screen">
        <!-- Modal Content -->
        <div class="relative bg-white dark:bg-gray-900 rounded-lg shadow-lg w-[320px] md:w-[400px] transition-transform transform scale-100">

            <!-- Modal Header -->
            <div class="flex justify-between items-center px-5 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center">
                    <i class="fas fa-trash-alt text-red-500 mr-2"></i>
                    Delete Device
                </h3>
                <button onclick="closeDeleteModal()" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                    <i class="fas fa-times"></i>
                </button>
            </div>

            <!-- Modal Body -->
            <div class="px-5 py-4">
                <p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    Are you sure you want to delete this device? This action cannot be undone.
                </p>
            </div>

            <!-- Modal Footer -->
            <div class="flex justify-end items-center px-5 py-4 border-t border-gray-200 dark:border-gray-700">
                <button onclick="closeDeleteModal()"
                    class="px-4 py-2 text-sm font-medium rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition">
                    Cancel
                </button>
                <br />
                <form id="deleteForm" method="POST" class="inline">
                    @csrf
                    @method('DELETE')
                    <button type="submit"
                        class="ml-4 px-4 py-2 text-sm font-medium rounded-md bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 transition">
                        Delete
                    </button>
                </form>
            </div>
        </div>
    </div>
</div>

<script>
function deleteDevice(id) {
    const modal = document.getElementById('deleteModal');
    const form = document.getElementById('deleteForm');
    form.action = `{{ url('/devices') }}/${id}`;
    modal.classList.remove('hidden');
    // Add fade-in effect
    setTimeout(() => modal.querySelector('div').classList.add('opacity-100'), 50);
}

function closeDeleteModal() {
    const modal = document.getElementById('deleteModal');
    // Add fade-out effect
    modal.querySelector('div').classList.remove('opacity-100');
    setTimeout(() => modal.classList.add('hidden'), 150);
}

// Close modal when clicking outside
document.addEventListener('click', function(e) {
    const modal = document.getElementById('deleteModal');
    if (e.target === modal) {
        closeDeleteModal();
    }
});

// Close notifications after 3 seconds
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
        const notifications = document.querySelectorAll('[role="alert"]');
        notifications.forEach(notification => {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        });
    }, 3000);
});

function searchDevices(query) {
    const tableRows = document.querySelectorAll('tbody tr:not(.empty-message)');
    const tbody = document.querySelector('tbody');
    query = query.toLowerCase().trim();

    // Remove existing empty message if it exists
    const existingEmptyMessage = document.querySelector('.empty-message');
    if (existingEmptyMessage) {
        existingEmptyMessage.remove();
    }

    let visibleCount = 0;

    tableRows.forEach(row => {
        let text = '';
        row.querySelectorAll('td').forEach(cell => {
            if (!cell.querySelector('button')) { // Skip action buttons
                text += cell.textContent.toLowerCase() + ' ';
            }
        });

        if (text.includes(query)) {
            row.classList.remove('hidden');
            visibleCount++;
        } else {
            row.classList.add('hidden');
        }
    });

    // Show empty message if no results found
    if (visibleCount === 0) {
        const emptyMessage = `
            <tr class="empty-message bg-white dark:bg-gray-800">
                <td colspan="7" class="px-6 py-4 text-center">
                    <div class="flex flex-col items-center justify-center space-y-2">
                        <i class="fas fa-search text-gray-400 text-xl mb-2"></i>
                        <p class="text-gray-500 dark:text-gray-400">No devices found matching "<span class="font-medium">${query}</span>"</p>
                        <p class="text-sm text-gray-400 dark:text-gray-500">Try adjusting your search criteria</p>
                    </div>
                </td>
            </tr>
        `;
        tbody.insertAdjacentHTML('beforeend', emptyMessage);
    }
}
</script>
