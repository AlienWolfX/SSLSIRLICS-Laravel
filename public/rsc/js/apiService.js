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

    async getMunicipalityCount(municipalityCode) {
        try {
            const response = await fetch(
                `${this.baseUrl}${CONFIG.API.ENDPOINTS.MUNICIPALITY_COUNT}/${municipalityCode}`
            );
            if (!response.ok) throw new Error("Network response was not ok");
            return await response.json();
        } catch (error) {
            console.error(
                `Error fetching count for municipality ${municipalityCode}:`,
                error
            );
            return null;
        }
    }

    async getBarangayCount(path) {
        try {
            const response = await fetch(
                `${this.baseUrl}${CONFIG.API.ENDPOINTS.BARANGAY_COUNT}/${path}`
            );
            if (!response.ok) throw new Error("Network response was not ok");
            return await response.json();
        } catch (error) {
            console.error(`Error fetching count for barangay ${path}:`, error);
            return null;
        }
    }

    async getAllDevices() {
        try {
            const response = await fetch(
                `${this.baseUrl}${CONFIG.API.ENDPOINTS.GET_ALL_DEVICES}`
            );
            if (!response.ok) throw new Error("Network response was not ok");
            return await response.json();
        } catch (error) {
            console.error("Error fetching all devices:", error);
            return null;
        }
    }
}
window.apiService = new ApiService();
