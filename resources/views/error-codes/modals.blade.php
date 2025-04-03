<!-- Add Error Code Modal -->
<div id="addErrorCodeModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 hidden overflow-y-auto h-full w-full">
    <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3 text-center">
            <h3 class="text-lg leading-6 font-medium text-gray-900">Add Error Code</h3>
            <form id="addErrorCodeForm" class="mt-4">
                <div class="mb-4">
                    <input type="text" id="new_error_code" placeholder="Error Code"
                           class="w-full px-3 py-2 border rounded-md">
                </div>
                <div class="mb-4">
                    <input type="text" id="new_problem" placeholder="Problem"
                           class="w-full px-3 py-2 border rounded-md">
                </div>
                <div class="mb-4">
                    <input type="text" id="new_action" placeholder="Action"
                           class="w-full px-3 py-2 border rounded-md">
                </div>
                <div class="flex justify-end gap-4">
                    <button type="button" onclick="closeAddErrorCodeModal()"
                            class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md">Cancel</button>
                    <button type="submit"
                            class="px-4 py-2 bg-blue-500 text-white rounded-md">Save</button>
                </div>
            </form>
        </div>
    </div>
</div>

<!-- Edit Error Code Modal -->
<div id="editErrorCodeModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 hidden overflow-y-auto h-full w-full">
    <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3 text-center">
            <h3 class="text-lg leading-6 font-medium text-gray-900">Edit Error Code</h3>
            <form id="editErrorCodeForm" class="mt-4">
                <input type="hidden" id="edit_error_code">
                <div class="mb-4">
                    <input type="text" id="edit_problem" placeholder="Problem"
                           class="w-full px-3 py-2 border rounded-md">
                </div>
                <div class="mb-4">
                    <input type="text" id="edit_action" placeholder="Action"
                           class="w-full px-3 py-2 border rounded-md">
                </div>
                <div class="flex justify-end gap-4">
                    <button type="button" onclick="closeEditErrorCodeModal()"
                            class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md">Cancel</button>
                    <button type="submit"
                            class="px-4 py-2 bg-blue-500 text-white rounded-md">Update</button>
                </div>
            </form>
        </div>
    </div>
</div>
