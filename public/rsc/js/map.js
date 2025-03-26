class StreetlightMap {
    constructor() {
        this.map = null;
        this.provinceData = {
            ADN: { name: "Agusan del Norte", center: [8.9475, 125.5406] },
            ADS: { name: "Agusan del Sur", center: [8.4467, 125.7325] },
            SDS: { name: "Surigao del Sur", center: [8.5865, 126.0165] },
            SDN: { name: "Surigao del Norte", center: [9.5147, 125.5777] },
            DIN: { name: "Dinagat Islands", center: [10.1282, 125.6094] },
        };
        this.markers = new Map();
        this.municipalityMarkers = new Map();
        this.zoomThreshold = 11;
        this.caragaData = null;
        this.barangayMarkers = new Map();
        this.municipalityZoomThreshold = 8;
        this.barangayZoomThreshold = 12;
        this.detailZoomLevel = 14;
        this.lastClickedBarangay = null;
        this.streetlightMarkers = new Map();
        this.initialize();
    }

    async initialize() {
        this.map = L.map("map", {
            center: [9.160563, 125.872463],
            zoom: 8,
            zoomControl: false,
        }).addLayer(
            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png")
        );

        this.map.on("zoomend", () => {
            this.toggleMarkersVisibility();
        });

        await this.loadCaragaData();
        await this.addProvinceMarkers();
        this.startPolling(1000);
    }

    startPolling(interval) {
        this.polling = setInterval(() => this.updateMarkers(), interval);
    }

    createPopupContent(name, count) {
        return `
            <div class="card border-0 shadow-sm" style="min-width: 200px;">
                <div class="card-header bg-primary text-black">
                    <h5 class="card-title mb-0"><i class="fas fa-map-marker-alt me-2"></i>${name}</h5>
                </div>
                <div class="card-body">
                    <div class="badge bg-info text-white p-2">
                        <i class="fas fa-lightbulb me-1"></i>Total Devices: ${count}
                    </div>
                </div>
            </div>
        `;
    }

    async updateProvinceData(code, data, marker = null) {
        try {
            const response = await window.apiService.getProvinceCount(code);
            if (!response?.data) return null;

            const { has_inactive = false, has_maintenance = false } =
                response.data.status_summary || {};
            const icon = this.getMarkerIcon(has_inactive, has_maintenance);

            if (marker) {
                marker.setIcon(icon);
            }
        } catch (error) {
            console.error(`Error processing ${data.name}:`, error);
        }
    }

    async loadCaragaData() {
        try {
            const response = await fetch("/rsc/caraga.json");
            const data = await response.json();
            console.log("Loaded Caraga Data:", data);
            this.caragaData = data;
            return data;
        } catch (error) {
            console.error("Error loading Caraga data:", error);
            throw error;
        }
    }

    async loadMunicipalityMarkers(provinceCode) {
        try {
            console.group("Loading Municipality Markers");
            console.log("Province Code:", provinceCode);

            this.municipalityMarkers.forEach((marker) =>
                this.map.removeLayer(marker)
            );
            this.municipalityMarkers.clear();

            const provinceKey = Object.keys(
                this.caragaData["13"].province_list
            ).find(
                (key) =>
                    this.caragaData["13"].province_list[key].province_code ===
                    provinceCode
            );

            if (!provinceKey) {
                console.error("Province key not found:", provinceCode);
                return;
            }

            const provinceData =
                this.caragaData["13"].province_list[provinceKey];

            for (const [name, data] of Object.entries(
                provinceData.municipality_list
            )) {
                if (
                    !data?.coordinates?.latitude ||
                    !data?.coordinates?.longitude
                ) {
                    console.warn(
                        `Missing coordinates for municipality: ${name}`
                    );
                    continue;
                }

                const coordinates = [
                    data.coordinates.latitude,
                    data.coordinates.longitude,
                ];

                const response = await window.apiService.getMunicipalityCount(
                    `${provinceCode}/${data.municipality_code}`
                );

                if (!response?.data || response.data.total_devices === 0) {
                    console.log(`Skipping municipality ${name} - no devices`);
                    continue;
                }

                const { has_inactive = false, has_maintenance = false } =
                    response?.data?.status_summary || {};
                const count = response?.data?.total_devices || 0;

                const icon = this.getMarkerIcon(has_inactive, has_maintenance);
                const marker = L.marker(coordinates, { icon }).addTo(this.map);

                const popupContent = this.createPopupContent(name, count);
                marker.bindPopup(
                    L.popup({
                        closeButton: false,
                        offset: [0, -20],
                    }).setContent(popupContent)
                );

                marker.on("mouseover", () => {
                    marker.openPopup();
                    marker.setZIndexOffset(1000);
                    this.updatePopupContent(
                        marker,
                        name,
                        `${provinceCode}/${data.municipality_code}`,
                        "municipality"
                    );
                });

                marker.on("mouseout", () => {
                    marker.closePopup();
                    marker.setZIndexOffset(0);
                });

                marker.on("click", () => {
                    console.log(
                        "Municipality clicked:",
                        data.municipality_code
                    );
                    this.loadBarangayMarkers(
                        provinceCode,
                        data.municipality_code
                    );
                    this.map.flyTo(
                        coordinates,
                        this.barangayZoomThreshold,
                        {
                            animate: true,
                            duration: 1,
                            complete: () => {
                                console.log("Fly animation complete");
                                this.toggleMarkersVisibility();
                            },
                        }
                    );
                });

                const markerKey = `${provinceCode}_${data.municipality_code}`;
                this.municipalityMarkers.set(markerKey, marker);

                console.log(
                    `Added municipality marker: ${markerKey}`,
                    coordinates,
                    `Devices: ${count}`
                );
            }

            this.markers.forEach((marker) => marker.setOpacity(0));
            this.municipalityMarkers.forEach((marker) => marker.setOpacity(1));

            console.log(
                "Total municipality markers created:",
                this.municipalityMarkers.size
            );
            console.groupEnd();
        } catch (error) {
            console.error("Error in loadMunicipalityMarkers:", error);
            console.trace(error);
            console.groupEnd();
        }
    }

    async loadBarangayMarkers(provinceCode, municipalityCode) {
        try {
            console.group("Loading Barangay Markers");
            console.log(
                "Loading barangays for:",
                provinceCode,
                municipalityCode
            );

            this.barangayMarkers.forEach((marker) =>
                this.map.removeLayer(marker)
            );
            this.barangayMarkers.clear();

            const provinceKey = Object.keys(
                this.caragaData["13"].province_list
            ).find(
                (key) =>
                    this.caragaData["13"].province_list[key].province_code ===
                    provinceCode
            );

            if (!provinceKey) {
                console.error("Province key not found:", provinceCode);
                console.groupEnd();
                return;
            }

            const provinceData =
                this.caragaData["13"].province_list[provinceKey];

            const municipalityKey = Object.keys(
                provinceData.municipality_list
            ).find(
                (key) =>
                    provinceData.municipality_list[key].municipality_code ===
                    municipalityCode
            );

            if (!municipalityKey) {
                console.error("Municipality key not found:", municipalityCode);
                console.groupEnd();
                return;
            }

            const municipality =
                provinceData.municipality_list[municipalityKey];

            // Use barangays instead of barangay_list
            if (!municipality?.barangays) {
                console.error(
                    "No barangays found for municipality:",
                    municipality.name
                );
                console.groupEnd();
                return;
            }

            console.log(
                "Found municipality:",
                municipalityKey,
                "with",
                Object.keys(municipality.barangays).length,
                "barangays"
            );

            // Remove existing markers
            this.markers.forEach((marker) => this.map.removeLayer(marker));
            this.municipalityMarkers.forEach((marker) =>
                this.map.removeLayer(marker)
            );
            this.barangayMarkers.forEach((marker) =>
                this.map.removeLayer(marker)
            );

            // Create markers for each barangay
            for (const [name, data] of Object.entries(municipality.barangays)) {
                if (
                    !data?.coordinates?.latitude ||
                    !data?.coordinates?.longitude
                ) {
                    console.warn(`Missing coordinates for barangay: ${name}`);
                    continue;
                }

                const coordinates = [
                    data.coordinates.latitude,
                    data.coordinates.longitude,
                ];

                const response = await window.apiService.getBarangayCount(
                    `${provinceCode}/${municipalityCode}/${data.barangay_code}`
                );

                if (!response?.data || response.data.total_devices === 0) {
                    console.log(`Skipping barangay ${name} - no devices`);
                    continue;
                }

                const { has_inactive = false, has_maintenance = false } =
                    response?.data?.status_summary || {};
                const count = response?.data?.total_devices || 0;

                const icon = this.getMarkerIcon(has_inactive, has_maintenance);
                const marker = L.marker(coordinates, { icon }).addTo(this.map);

                const popupContent = this.createPopupContent(name, count);
                marker.bindPopup(
                    L.popup({
                        closeButton: false,
                        offset: [0, -20],
                    }).setContent(popupContent)
                );

                marker.on("mouseover", () => {
                    marker.openPopup();
                    marker.setZIndexOffset(1000);
                    this.updatePopupContent(
                        marker,
                        name,
                        `${provinceCode}/${municipalityCode}/${data.barangay_code}`,
                        "barangay"
                    );
                });

                marker.on("mouseout", () => {
                    marker.closePopup();
                    marker.setZIndexOffset(0);
                });

                marker.on("click", () => {
                    this.lastClickedBarangay = marker;
                    const [province, municipality, barangay] =
                        markerKey.split("_");

                    this.toggleMarkersVisibility();
                    this.loadStreetlightMarkers(
                        province,
                        municipality,
                        barangay
                    );

                    this.map.flyTo(coordinates, this.detailZoomLevel, {
                        animate: true,
                        duration: 1,
                        complete: () => {
                            console.log("Zoomed to barangay detail");
                        },
                    });
                });

                const markerKey = `${provinceCode}_${municipalityCode}_${data.barangay_code}`;
                this.barangayMarkers.set(markerKey, marker);
            }

            this.municipalityMarkers.forEach((marker) => marker.setOpacity(0));
            this.barangayMarkers.forEach((marker) => marker.setOpacity(1));

            console.log(
                "Total barangay markers created:",
                this.barangayMarkers.size
            );
            console.groupEnd();
        } catch (error) {
            console.error("Error loading barangay markers:", error);
            console.trace(error);
            console.groupEnd();
        }
    }

    getMarkerIcon(hasInactive, hasMaintenance) {
        if (hasMaintenance) return StreetlightMap.markerIcons.maintenance;
        if (hasInactive) return StreetlightMap.markerIcons.inactive;
        return StreetlightMap.markerIcons.active;
    }

    async updateMarkers() {
        // Update existing markers and hide those that now have 0 count
        for (const [code, data] of Object.entries(this.provinceData)) {
            const response = await window.apiService.getProvinceCount(code);
            const marker = this.markers.get(code);

            if (!response?.data || response.data.total_devices === 0) {
                marker?.setOpacity(0);
            } else {
                await this.updateProvinceData(code, data, marker);
                marker?.setOpacity(1);
            }
        }

        // Similar updates for municipality and barangay markers
        if (this.municipalityMarkers.size > 0) {
            await this.updateMunicipalityMarkersWithVisibility();
        }

        if (this.barangayMarkers.size > 0) {
            await this.updateBarangayMarkersWithVisibility();
        }
    }

    async updateMunicipalityMarkersWithVisibility() {
        try {
            const firstKey = Array.from(this.municipalityMarkers.keys())[0];
            const provinceCode = firstKey.split("_")[0];

            const provinceKey = Object.keys(
                this.caragaData["13"].province_list
            ).find(
                (key) =>
                    this.caragaData["13"].province_list[key].province_code ===
                    provinceCode
            );

            if (!provinceKey) return;

            const provinceData =
                this.caragaData["13"].province_list[provinceKey];

            for (const [name, data] of Object.entries(
                provinceData.municipality_list
            )) {
                const markerKey = `${provinceCode}_${data.municipality_code}`;
                const marker = this.municipalityMarkers.get(markerKey);

                if (!marker) continue;

                // Get updated municipality data
                const response = await window.apiService.getMunicipalityCount(
                    `${provinceCode}/${data.municipality_code}`
                );

                if (!response?.data || response.data.total_devices === 0) {
                    marker.setOpacity(0);
                } else {
                    const { has_inactive = false, has_maintenance = false } =
                        response.data.status_summary || {};
                    const icon = this.getMarkerIcon(
                        has_inactive,
                        has_maintenance
                    );
                    marker.setIcon(icon);
                    marker.setOpacity(1);
                }
            }
        } catch (error) {
            console.error("Error updating municipality markers:", error);
        }
    }

    async updateBarangayMarkersWithVisibility() {
        try {
            const firstKey = Array.from(this.barangayMarkers.keys())[0];
            if (!firstKey) return;

            const [provinceCode, municipalityCode] = firstKey.split("_");

            // Find province data
            const provinceKey = Object.keys(
                this.caragaData["13"].province_list
            ).find(
                (key) =>
                    this.caragaData["13"].province_list[key].province_code ===
                    provinceCode
            );

            if (!provinceKey) return;

            const provinceData =
                this.caragaData["13"].province_list[provinceKey];

            const municipalityKey = Object.keys(
                provinceData.municipality_list
            ).find(
                (key) =>
                    provinceData.municipality_list[key].municipality_code ===
                    municipalityCode
            );

            if (!municipalityKey) return;

            const municipality =
                provinceData.municipality_list[municipalityKey];

            for (const [name, data] of Object.entries(municipality.barangays)) {
                const markerKey = `${provinceCode}_${municipalityCode}_${data.barangay_code}`;
                const marker = this.barangayMarkers.get(markerKey);

                if (!marker) continue;

                const response = await window.apiService.getBarangayCount(
                    `${provinceCode}/${municipalityCode}/${data.barangay_code}`
                );

                if (!response?.data || response.data.total_devices === 0) {
                    marker.setOpacity(0);
                } else {
                    const { has_inactive = false, has_maintenance = false } =
                        response.data.status_summary || {};
                    const icon = this.getMarkerIcon(
                        has_inactive,
                        has_maintenance
                    );
                    marker.setIcon(icon);
                    marker.setOpacity(1);
                }
            }
        } catch (error) {
            console.error("Error updating barangay markers:", error);
        }
    }

    async addProvinceMarkers() {
        try {
            if (!this.caragaData) {
                console.error("Caraga data not loaded");
                return;
            }

            const provinceList = this.caragaData["13"].province_list;

            for (const [provinceName, provinceData] of Object.entries(
                provinceList
            )) {
                const code = provinceData.province_code;

                if (!provinceData?.coordinates) {
                    console.warn(`No coordinates for province: ${code}`);
                    continue;
                }

                const coordinates = [
                    provinceData.coordinates.latitude,
                    provinceData.coordinates.longitude,
                ];

                const response = await window.apiService.getProvinceCount(code);

                // Skip if no data or count is 0
                if (!response?.data || response.data.total_devices === 0)
                    continue;

                const { has_inactive = false, has_maintenance = false } =
                    response.data.status_summary || {};
                const count = response.data.total_devices;
                const icon = this.getMarkerIcon(has_inactive, has_maintenance);

                const marker = L.marker(coordinates, { icon }).addTo(this.map);
                const popupContent = this.createPopupContent(
                    provinceName,
                    count
                );

                marker.bindPopup(
                    L.popup({ closeButton: false }).setContent(popupContent)
                );

                marker.on("mouseover", () => {
                    marker.openPopup();
                    this.updatePopupContent(
                        marker,
                        provinceName,
                        code,
                        "province"
                    );
                });

                marker.on("mouseout", function () {
                    this.closePopup();
                });

                marker.on("click", () => {
                    console.log("Province clicked:", code);
                    // Diri raning duha kay if ibutang sa flyto dili mu display
                    this.loadMunicipalityMarkers(code);
                    this.toggleMarkersVisibility();
                    this.map.flyTo(coordinates, 10, {
                        animate: true,
                        duration: 1,
                        complete: () => {
                            console.log("Fly animation complete");
                        },
                    });
                });

                this.markers.set(code, marker);
                console.log(`Added province marker: ${code}`, coordinates);
            }
        } catch (error) {
            console.error("Error adding province markers:", error);
            throw error;
        }
    }

    async toggleMarkersVisibility() {
        const currentZoom = this.map.getZoom();
        console.log("Current zoom level:", currentZoom);

        this.markers.forEach((marker) => this.map.removeLayer(marker));
        this.municipalityMarkers.forEach((marker) =>
            this.map.removeLayer(marker)
        );
        this.barangayMarkers.forEach((marker) => this.map.removeLayer(marker));

        if (currentZoom >= this.detailZoomLevel) {
            console.log("Detail view - showing only streetlight markers");
            this.streetlightMarkers.forEach((marker) => marker.addTo(this.map));
            return;
        }

        this.streetlightMarkers.forEach((marker) =>
            this.map.removeLayer(marker)
        );

        if (currentZoom >= this.detailZoomLevel) {
            console.log("Detail view - hiding all markers");
            return;
        }

        let markersToShow = new Map();

        if (currentZoom >= this.barangayZoomThreshold) {
            markersToShow = this.barangayMarkers;
        } else if (currentZoom >= this.municipalityZoomThreshold) {
            markersToShow = this.municipalityMarkers;
        } else {
            markersToShow = this.markers;
        }

        markersToShow.forEach((marker) => {
            if (marker.options.icon) {
                marker.addTo(this.map);
                marker.setZIndexOffset(
                    currentZoom >= this.barangayZoomThreshold
                        ? 200
                        : currentZoom >= this.municipalityZoomThreshold
                        ? 100
                        : 0
                );
            }
        });
    }

    static markerIcons = {
        active: L.icon({
            iconUrl:
                "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
            shadowUrl:
                "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41],
        }),
        inactive: L.icon({
            iconUrl:
                "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
            shadowUrl:
                "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41],
        }),
        maintenance: L.icon({
            iconUrl:
                "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png",
            shadowUrl:
                "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41],
        }),
    };

    static streetlightIcons = {
        active: L.icon({
            iconUrl:
                "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
            shadowUrl:
                "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
            iconSize: [15, 24],
            iconAnchor: [7, 24],
            popupAnchor: [1, -20],
            shadowSize: [24, 24],
        }),
        inactive: L.icon({
            iconUrl:
                "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
            shadowUrl:
                "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
            iconSize: [15, 24],
            iconAnchor: [7, 24],
            popupAnchor: [1, -20],
            shadowSize: [24, 24],
        }),
        maintenance: L.icon({
            iconUrl:
                "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png",
            shadowUrl:
                "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
            iconSize: [15, 24],
            iconAnchor: [7, 24],
            popupAnchor: [1, -20],
            shadowSize: [24, 24],
        }),
    };

    async updatePopupContent(marker, name, path, markerType = "province") {
        if (!marker.isPopupOpen()) return;

        let response;
        switch (markerType) {
            case "province":
                response = await window.apiService.getProvinceCount(path);
                break;
            case "municipality":
                response = await window.apiService.getMunicipalityCount(path);
                break;
            case "barangay":
                response = await window.apiService.getBarangayCount(path);
                break;
        }

        if (!response?.data) return;

        const count = response.data.total_devices || 0;
        const popupContent = this.createPopupContent(name, count);
        marker.getPopup().setContent(popupContent);
    }

    async loadStreetlightMarkers(provinceCode, municipalityCode, barangayCode) {
        try {
            this.streetlightMarkers.forEach((marker) =>
                this.map.removeLayer(marker)
            );
            this.streetlightMarkers.clear();

            const response = await window.apiService.getStreetlightCoordinates(
                provinceCode,
                municipalityCode,
                barangayCode
            );

            if (!response?.data?.devices?.length) return;

            const markers = response.data.devices.map((device) => {
                const coordinates = [
                    device.coordinates.lat,
                    device.coordinates.long,
                ];

                const icon = this.getMarkerIconByStatus(device.status);
                const marker = L.marker(coordinates, {
                    icon,
                    // Remove riseOnHover for smoother performance
                    riseOnHover: false,
                });

                const statusBadge = `
                    <span class="badge ${this.getStatusBadgeClass(
                        device.status
                    )}">
                        <i class="fas fa-circle me-1"></i>${device.status}
                    </span>
                `;

                const popupContent = `
                    <div class="card border-0 shadow-sm">
                        <div class="card-body p-2">
                            <small class="text-muted">SOC ID:</small>
                            <strong>${device.soc_id}</strong>
                            <div class="mt-1">
                                <small class="text-muted">Status:</small>
                                ${this.getStatusContent(
                                    device.status,
                                    device.updated_at
                                )}
                            </div>
                            <div class="mt-2 text-center">
                                <button onclick="streetlightMap.showDetails('${
                                    device.soc_id
                                }')"
                                        class="btn btn-primary btn-sm w-100">
                                    <i class="fas fa-info-circle me-1"></i>More Details
                                </button>
                            </div>
                        </div>
                    </div>
                `;

                // Only show popup on click, remove hover behavior
                marker.bindPopup(popupContent, {
                    closeButton: true,
                    closeOnClick: true,
                    autoClose: true,
                });

                marker.deviceData = {
                    soc_id: device.soc_id,
                    status: device.status,
                };

                this.streetlightMarkers.set(device.soc_id, marker);
                return marker;
            });

            L.featureGroup(markers).addTo(this.map);

            if (!this.statusPolling) {
                this.startStatusPolling();
            }
        } catch (error) {
            console.error("Error loading streetlight markers:", error);
        }
    }

    startStatusPolling() {
        const POLLING_INTERVAL = 5000; // 5 seconds
        this.statusPolling = setInterval(async () => {
            try {
                const socIds = Array.from(this.streetlightMarkers.keys());

                for (const socId of socIds) {
                    const response =
                        await window.apiService.getStreetlightStatus(socId);
                    if (response?.data?.status) {
                        const marker = this.streetlightMarkers.get(socId);
                        if (
                            marker &&
                            marker.deviceData.status !== response.data.status
                        ) {
                            this.updateMarkerStatus(
                                marker,
                                response.data.status
                            );
                            marker.deviceData.status = response.data.status;

                            // Update popup if it's open
                            if (marker.isPopupOpen()) {
                                const content = this.getStatusContent(
                                    response.data.status,
                                    response.data.updated_at
                                );
                                const popup = marker.getPopup();
                                const currentContent = popup.getContent();
                                const newContent = currentContent.replace(
                                    /<span class="badge.*?<\/div>/s,
                                    content
                                );
                                popup.setContent(newContent);
                            }
                        }
                    }
                }
            } catch (error) {
                console.error("Error updating streetlight statuses:", error);
            }
        }, POLLING_INTERVAL);
    }

    getStatusBadgeClass(status) {
        switch (status.toLowerCase()) {
            case "active":
                return "bg-success";
            case "inactive":
                return "bg-danger";
            case "maintenance":
                return "bg-warning";
            default:
                return "bg-secondary";
        }
    }

    getStatusContent(status, date) {
        return `
            <span class="badge ${this.getStatusBadgeClass(status)}">
                <i class="fas fa-circle me-1"></i>${status}
            </span>
        `;
    }

    getMarkerIconByStatus(status) {
        switch (status.toLowerCase()) {
            case "active":
                return StreetlightMap.streetlightIcons.active;
            case "inactive":
                return StreetlightMap.streetlightIcons.inactive;
            case "maintenance":
                return StreetlightMap.streetlightIcons.maintenance;
            default:
                return StreetlightMap.streetlightIcons.inactive;
        }
    }

    updateMarkerStatus(marker, status) {
        const newIcon = this.getMarkerIconByStatus(status);
        marker.setIcon(newIcon);
    }

    clearStatusPolling() {
        if (this.statusPolling) {
            clearInterval(this.statusPolling);
            this.statusPolling = null;
        }
    }

    async showDetails(socId) {
        try {
            const response = await window.apiService.getStreetlightDetails(
                socId
            );
            if (!response?.data) return;

            const data = response.data;

            // Format the timestamp
            const lastUpdate = new Date(data.last_update);
            const formattedDate = lastUpdate.toLocaleString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
            });

            // Helper function to safely format numeric values
            const formatValue = (value, decimals = 1, unit = "") => {
                return value != null && !isNaN(value)
                    ? `${Number(value).toFixed(decimals)}${unit}`
                    : "-";
            };

            // Update modal content with latest readings
            document.getElementById("modal-barangay-text").textContent =
                data.location || "-";
            document.getElementById("modal-solv").textContent = formatValue(
                data.solar_voltage,
                1,
                "V"
            );
            document.getElementById("modal-solc").textContent = formatValue(
                data.solar_current,
                2,
                "A"
            );
            document.getElementById("modal-last-update").textContent =
                formattedDate;
            document.getElementById("modal-status-badge").textContent =
                data.status || "-";
            document.getElementById(
                "modal-status-badge"
            ).className = `badge ${this.getStatusBadgeClass(data.status)}`;
            document.getElementById("modal-bulbv").textContent = formatValue(
                data.bulb_voltage,
                1,
                "V"
            );
            document.getElementById("modal-curv").textContent = formatValue(
                data.current,
                2,
                "A"
            );
            document.getElementById("modal-batsoc").textContent = formatValue(
                data.battery_soc,
                1,
                "%"
            );
            document.getElementById("modal-batv").textContent = formatValue(
                data.battery_voltage,
                1,
                "V"
            );
            document.getElementById("modal-batc").textContent = formatValue(
                data.battery_current,
                2,
                "A"
            );

            // Process historical data and latest reading for the chart
            const chargingHistory = data.charging_history || [];

            // Add the latest reading to the history if it exists and has valid values
            if (
                data.last_update &&
                (data.battery_soc != null ||
                    data.solar_voltage != null ||
                    data.battery_voltage != null ||
                    data.current != null)
            ) {
                chargingHistory.push({
                    timestamp: data.last_update,
                    battery_soc: data.battery_soc,
                    solar_voltage: data.solar_voltage,
                    battery_voltage: data.battery_voltage,
                    current: data.current,
                });
            }

            // Sort the data by timestamp
            chargingHistory.sort(
                (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
            );

            // Initialize or update the chart with the combined data
            this.initializeOrUpdateChart(chargingHistory);

            // Show the modal
            const modal = new bootstrap.Modal(
                document.getElementById("streetlightModal")
            );

            // Start real-time updates when modal is shown
            modal.show();
            this.startChartPolling(socId);

            // Listen for modal close
            document.getElementById("streetlightModal").addEventListener(
                "hidden.bs.modal",
                () => {
                    this.clearChartPolling();
                },
                { once: true }
            );

            // Adjust chart after modal is shown
            setTimeout(() => {
                if (this.chargingChart) {
                    this.chargingChart.updateOptions({
                        chart: {
                            height: "100%",
                        },
                    });
                }
                window.dispatchEvent(new Event("resize"));
            }, 250);

            // Start chart polling
            this.startChartPolling(socId);
        } catch (error) {
            console.error("Error loading streetlight details:", error);
        }
    }

    initializeOrUpdateChart(chargingHistory) {
        const chartOptions = {
            series: [
                {
                    name: "Battery SOC", // Changed from "Battery Level"
                    data:
                        chargingHistory?.map((h) => ({
                            x: new Date(h.timestamp),
                            y: h.battery_soc, // Changed from battery_level
                        })) || [],
                },
                {
                    name: "Solar Voltage",
                    data:
                        chargingHistory?.map((h) => ({
                            x: new Date(h.timestamp),
                            y: h.solar_voltage,
                        })) || [],
                },
                {
                    name: "Battery Voltage",
                    data:
                        chargingHistory?.map((h) => ({
                            x: new Date(h.timestamp),
                            y: h.battery_voltage,
                        })) || [],
                },
            ],
            chart: {
                type: "line",
                height: 350,
                animations: {
                    enabled: true,
                    easing: "linear",
                    dynamicAnimation: {
                        speed: 1000,
                    },
                },
                toolbar: {
                    show: true,
                    tools: {
                        download: true,
                        selection: true,
                        zoom: true,
                        zoomin: true,
                        zoomout: true,
                        pan: true,
                        reset: true,
                    },
                },
            },
            stroke: {
                curve: "smooth",
                width: 2,
            },
            colors: ["#00E396", "#FEB019", "#008FFB", "#FF4560"],
            xaxis: {
                type: "datetime",
                range: 30 * 60 * 1000, // Show last 30 minutes
                labels: {
                    datetimeFormatter: {
                        year: "yyyy",
                        month: "MMM 'yy",
                        day: "dd MMM",
                        hour: "HH:mm",
                    },
                },
            },
            yaxis: [
                {
                    title: {
                        text: "Battery Level (%)",
                    },
                    labels: {
                        formatter: (val) => {
                            return val != null && !isNaN(val)
                                ? `${val.toFixed(1)}%`
                                : "-";
                        },
                    },
                },
                {
                    title: {
                        text: "Voltage (V)",
                    },
                    labels: {
                        formatter: (val) => {
                            return val != null && !isNaN(val)
                                ? `${val.toFixed(1)}V`
                                : "-";
                        },
                    },
                    opposite: true,
                },
            ],
            tooltip: {
                shared: true,
                x: {
                    format: "dd MMM yyyy HH:mm",
                },
                y: {
                    formatter: function (value, { seriesIndex }) {
                        if (!value || isNaN(value)) return "-";

                        switch (seriesIndex) {
                            case 0: // Battery Level
                                return `${value.toFixed(1)}%`;
                            case 3: // Current
                                return `${value.toFixed(2)}A`;
                            default: // Voltages
                                return `${value.toFixed(1)}V`;
                        }
                    },
                },
            },
            legend: {
                position: "top",
                horizontalAlign: "center",
            },
        };

        // Filter out invalid values from the data
        chartOptions.series = chartOptions.series.map((series) => ({
            ...series,
            data: series.data.filter(
                (point) => point.y != null && !isNaN(point.y) && point.x != null
            ),
        }));

        if (this.chargingChart) {
            this.chargingChart.updateOptions(chartOptions);
        } else {
            this.chargingChart = new ApexCharts(
                document.querySelector("#modal-charging-chart"),
                chartOptions
            );
            this.chargingChart.render();
        }
    }

    startChartPolling(socId) {
        if (this.chartPolling) {
            clearInterval(this.chartPolling);
        }

        const CHART_POLLING_INTERVAL = 5000;
        this.chartPolling = setInterval(async () => {
            try {
                const response = await window.apiService.getStreetlightDetails(
                    socId
                );
                if (!response?.data) return;

                const data = response.data; // Access data directly
                if (!data) return;

                // Update status badge with class
                const statusBadge =
                    document.getElementById("modal-status-badge");
                if (statusBadge) {
                    statusBadge.textContent = data.status;
                    statusBadge.className = `badge ${this.getStatusBadgeClass(
                        data.status
                    )}`;
                }

                // Update other modal values
                document.getElementById(
                    "modal-solv"
                ).textContent = `${data.solar_voltage}V`;
                document.getElementById(
                    "modal-solc"
                ).textContent = `${data.solar_current}A`;
                document.getElementById(
                    "modal-bulbv"
                ).textContent = `${data.bulb_voltage}V`;
                document.getElementById(
                    "modal-curv"
                ).textContent = `${data.current}A`;
                document.getElementById(
                    "modal-batsoc"
                ).textContent = `${data.battery_soc}%`;
                document.getElementById(
                    "modal-batv"
                ).textContent = `${data.battery_voltage}V`;
                document.getElementById(
                    "modal-batc"
                ).textContent = `${data.battery_current}A`;
                document.getElementById("modal-last-update").textContent =
                    new Date(data.last_update).toLocaleString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                    });

                // Update chart with new data
                if (this.chargingChart && data.last_update) {
                    const newPoint = {
                        timestamp: data.last_update,
                        battery_soc: data.battery_soc,
                        solar_voltage: data.solar_voltage,
                        battery_voltage: data.battery_voltage,
                    };

                    this.chargingChart.appendData([
                        {
                            data: [
                                {
                                    x: new Date(newPoint.timestamp),
                                    y: Number(newPoint.battery_soc),
                                },
                            ],
                        },
                        {
                            data: [
                                {
                                    x: new Date(newPoint.timestamp),
                                    y: Number(newPoint.solar_voltage),
                                },
                            ],
                        },
                        {
                            data: [
                                {
                                    x: new Date(newPoint.timestamp),
                                    y: Number(newPoint.battery_voltage),
                                },
                            ],
                        },
                    ]);

                    // Keep only last 50 points
                    if (this.chargingChart.w.globals.series[0].length > 50) {
                        this.chargingChart.updateSeries([
                            {
                                data: this.chargingChart.w.globals.series[0].slice(
                                    -50
                                ),
                            },
                            {
                                data: this.chargingChart.w.globals.series[1].slice(
                                    -50
                                ),
                            },
                            {
                                data: this.chargingChart.w.globals.series[2].slice(
                                    -50
                                ),
                            },
                        ]);
                    }
                }
            } catch (error) {
                console.error("Error updating chart:", error);
            }
        }, CHART_POLLING_INTERVAL);
    }

    clearChartPolling() {
        if (this.chartPolling) {
            clearInterval(this.chartPolling);
            this.chartPolling = null;
        }
    }
}
