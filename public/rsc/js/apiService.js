class ApiService {
    constructor() {
        this.baseUrl = CONFIG.API.BASE_URL;
    }

    async getProvinceCount(provinceCode) {
        try {
            const response = await fetch(
                `${this.baseUrl}${CONFIG.API.ENDPOINTS.PROVINCE_COUNT}/${provinceCode}`
            );
            if (!response.ok) throw new Error("Network response was not ok");
            return await response.json();
        } catch (error) {
            console.error(
                `Error fetching count for province ${provinceCode}:`,
                error
            );
            return null;
        }
    }
}
window.apiService = new ApiService();
