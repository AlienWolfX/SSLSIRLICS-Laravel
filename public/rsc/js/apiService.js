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

    async getStreetlightCoordinates(
        provinceCode,
        municipalityCode,
        barangayCode
    ) {
        try {
            const response = await fetch(
                `${this.baseUrl}/showCoordinates/${provinceCode}/${municipalityCode}/${barangayCode}`
            );
            return await response.json();
        } catch (error) {
            console.error("Error fetching streetlight coordinates:", error);
            return null;
        }
    }

    async getStreetlightDetails(socId) {
        try {
            const response = await fetch(`${this.baseUrl}/readings/${socId}`);
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            const data = await response.json();
            if (data.status !== "success") {
                throw new Error("Failed to fetch streetlight details");
            }

            const latestReading = data.latest_reading;
            const historicalData = data.historical_data.map((entry) => ({
                timestamp: entry.timestamp,
                battery_level: entry.battery.state_of_charge,
                battery_voltage: entry.battery.voltage,
                battery_current: entry.battery.current,
                solar_voltage: entry.solar.voltage,
                solar_current: entry.solar.current,
                bulb_voltage: entry.bulb.voltage,
                bulb_current: entry.bulb.current,
            }));

            return {
                success: true,
                data: {
                    location: latestReading.SOCid,
                    solar_voltage: latestReading.solv,
                    solar_current: latestReading.solc,
                    last_update: latestReading.date,
                    status: this.capitalizeFirstLetter(
                        data.latest_reading.device?.status
                    ),
                    bulb_voltage: latestReading.bulbv,
                    current: latestReading.bulbc,
                    battery_soc: latestReading.batsoc,
                    battery_voltage: latestReading.batv,
                    battery_current: latestReading.batc,
                    charging_history: historicalData,
                },
            };
        } catch (error) {
            console.error("Error fetching streetlight details:", error);
            return {
                success: false,
                error: error.message,
            };
        }
    }

    capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    async getStreetlightStatus(socId) {
        try {
            const response = await fetch(
                `${this.baseUrl}${CONFIG.API.ENDPOINTS.READINGS}/${socId}`
            );
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            const data = await response.json();
            if (data.status !== "success") {
                throw new Error("Failed to fetch streetlight status");
            }

            return {
                success: true,
                data: {
                    status: data.latest_reading.device?.status || "unknown",
                    last_update: data.latest_reading.date,
                    soc_id: data.latest_reading.SOCid,
                },
            };
        } catch (error) {
            console.error("Error fetching streetlight status:", error);
            return {
                success: false,
                error: error.message,
            };
        }
    }
}
window.apiService = new ApiService();
