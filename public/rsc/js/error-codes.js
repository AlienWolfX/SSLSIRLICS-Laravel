function searchErrorCodes(query) {
    const tableWrapper = document
        .querySelector("#error-codes-table")
        .closest(".relative");
    const tableBody = document.querySelector("#error-codes-table tbody");
    const rows = tableBody.querySelectorAll("tr:not(.empty-message)");
    query = query.toLowerCase().trim();

    // Set fixed height before search
    tableWrapper.style.minHeight = tableWrapper.offsetHeight + "px";

    // Clear previous empty message
    const existingEmpty = tableBody.querySelector(".empty-message");
    if (existingEmpty) existingEmpty.remove();

    let visibleCount = 0;

    rows.forEach((row) => {
        const text = Array.from(row.querySelectorAll("td"))
            .filter((cell) => !cell.querySelector("button"))
            .map((cell) => cell.textContent.toLowerCase())
            .join(" ");

        if (text.includes(query)) {
            row.classList.remove("hidden");
            visibleCount++;
        } else {
            row.classList.add("hidden");
        }
    });

    if (visibleCount === 0) {
        const emptyMessage = `
            <tr class="empty-message">
                <td colspan="4" class="px-6 py-4 text-center">
                    <div class="flex flex-col items-center justify-center py-8">
                        <i class="fas fa-search text-gray-400 text-xl mb-2"></i>
                        <p class="text-gray-500 dark:text-gray-400">No error codes found matching "<span class="font-medium">${query}</span>"</p>
                    </div>
                </td>
            </tr>
        `;
        tableBody.insertAdjacentHTML("beforeend", emptyMessage);
    }
}
