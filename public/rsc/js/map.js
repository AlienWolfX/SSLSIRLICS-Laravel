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
        this.municipalityZoomThreshold = 9;
        this.barangayZoomThreshold = 12;
        this.detailZoomLevel = 14;
        this.lastClickedBarangay = null;
        this.streetlightMarkers = new Map();
        this.geoJsonHandlers = null;
        this.initialize();
    }

    async initialize() {
        // Initialize base map with decimal zoom support
        this.map = L.map("map", {
            center: [9.160563, 125.872463],
            zoom: 8.45,
            zoomSnap: 0.1,        // Allows decimal zoom levels (0.1 increments)
            zoomDelta: 0.1,       // Controls zoom level changes
            wheelPxPerZoomLevel: 120,  // Smoother zoom with mouse wheel
            zoomControl: false,
            wheelDebounceTime: 40 // Smoother wheel zooming
        }).addLayer(
            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: '© OpenStreetMap contributors',
                minZoom: 1,
                maxZoom: 19
            })
        );

        // Verify zoom level is set correctly
        console.log('Initial zoom level:', this.map.getZoom());

        // Add zoom validation on zoom events
        this.map.on('zoomend', () => {
            const currentZoom = this.map.getZoom();
            console.log('New zoom level:', currentZoom);
            // Round to 1 decimal place if needed
            const roundedZoom = Math.round(currentZoom * 10) / 10;
            if (currentZoom !== roundedZoom) {
                this.map.setZoom(roundedZoom, { animate: false });
            }
        });

        // Initialize GeoJSON handlers using the global class
        this.geoJsonHandlers = new GeoJsonHandlers(this.map);
        
        // Initialize GeoJSON layers
        await this.initializeGeoJsonLayers();

        // Set up other map event listeners
        this.map.on("zoomend", () => {
            this.toggleMarkersVisibility();
        });

        // Load data and start polling
        await this.loadCaragaData();
        await this.addProvinceMarkers();
        this.startPolling(1000);
    }

    // Add new method for GeoJSON initialization
    async initializeGeoJsonLayers() {
        const geoJsonFiles = {
            ADS: "agusandelsur.geojson",
            ADN: "agusandelnorte.geojson",
            DIN: "dinagatisland.geojson",
            SDN: "surigaodelnorte.geojson",
            SDS: "surigaodelsur.geojson",
        };

        // Initialize GeoJSON layer group
        this.geoJsonLayer = L.layerGroup().addTo(this.map);
        this.geoJsonLayers = {};
        this.activeGeoJsonLayer = null;

        // Start the initialization coordinates -//
        this.loadCoordinates();

        // Add custom CSS styles for GeoJSON layers
        this.addGeoJsonStyles();

        // Load all GeoJSON files
        await Promise.all(
            Object.entries(geoJsonFiles).map(([regionCode, fileName]) => 
                this.loadGeoJsonFile(regionCode, fileName)
            )
        );
    }

    // Add method for GeoJSON styles
    addGeoJsonStyles() {
        if (!document.getElementById("geojson-styles")) {
            const style = document.createElement("style");
            style.id = "geojson-styles";
            style.textContent = `
                .leaflet-interactive {
                    outline: none !important;
                }
                .province-name-tooltip {
                    background: none;
                    border: none;
                    box-shadow: none;
                    color: #000;
                    font-weight: bold;
                    font-size: 16px;
                    text-shadow:
                        -1px -1px 0 #fff,
                        1px -1px 0 #fff,
                        -1px 1px 0 #fff,
                        1px 1px 0 #fff;
                    text-align: center;
                    pointer-events: none;
                    transition: opacity 0.3s;
                }
            `;
            document.head.appendChild(style);
        }
    }

    // Add method for loading individual GeoJSON files
    async loadGeoJsonFile(regionCode, fileName) {
        try {
            const response = await fetch(`/rsc/geojson/${fileName}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            
            this.geoJsonLayers[regionCode] = L.geoJSON(data, {
                style: this.getGeoJsonStyle(),
                onEachFeature: (feature, layer) => this.setupGeoJsonLayer(feature, layer)
            }).addTo(this.geoJsonLayer);

        } catch (error) {
            console.error(`Error loading GeoJSON for ${regionCode}:`, error);
        }
    }

    // Add method for GeoJSON styling
    getGeoJsonStyle() {
        return {
            color: "transparent",
            weight: 0,
            fillOpacity: 0,
            fillColor: "transparent",
            className: "geojson-path",
            smoothFactor: 1.5,
            interactive: true,
            bubblingMouseEvents: false
        };
    }

    // Add method for setting up GeoJSON layer interactions
    setupGeoJsonLayer(feature, layer) {
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent
        );

        layer.isVisible = false;
        layer.nameTooltip = null;

        layer.on({
            mouseover: (e) => this.geoJsonHandlers.handleGeoJsonMouseOver(e, feature, layer, isMobile),
            mouseout: (e) => this.geoJsonHandlers.handleGeoJsonMouseOut(e, layer, isMobile),
            click: (e) => this.geoJsonHandlers.handleGeoJsonClick(e, feature, layer)
        });
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
                    this.findTargetProvince(provinceData);
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

    async findTargetProvince(provinceData) {
        try {
            const coordinates = [
                parseFloat(provinceData.coordinates.latitude),
                parseFloat(provinceData.coordinates.longitude)
            ];

            console.log('Finding province for coordinates:', coordinates);

            // Find the province with the closest match
            let bestMatch = null;
            let shortestDistance = Infinity;

            for (const [code, data] of Object.entries(this.provinceData)) {
                const isInProvince = await this.isCoordinateInProvince(coordinates[0], coordinates[1], code);
                
                if (isInProvince) {
                    const provinceCenter = await this.getProvinceCenterFromCaraga(code);
                    if (provinceCenter) {
                        const distance = this.calculateDistance(
                            coordinates[0], coordinates[1],
                            provinceCenter[0], provinceCenter[1]
                        );
                        
                        if (distance < shortestDistance) {
                            shortestDistance = distance;
                            bestMatch = {
                                ...data,
                                code,
                                center: provinceCenter
                            };
                        }
                    }
                }
            }

            if (bestMatch) {
                console.log(`Flying to ${bestMatch.name}`, bestMatch.center);
                this.map.flyTo(bestMatch.center, 10, {
                    animate: true,
                    duration: 1,
                    complete: () => {
                        console.log(`Zoomed to province: ${bestMatch.name}`);
                        this.toggleMarkersVisibility();
                    }
                });
            } else {
                console.log('No matching province found');
                this.map.flyTo(coordinates, 10, {
                    animate: true,
                    duration: 1
                });
            }

        } catch (error) {
            console.error('Error in findTargetProvince:', error);
        }
    }

    async isCoordinateInProvince(lat, lng, provinceCode) {
        try {
            if (!this.caragaData) {
                console.error('Caraga data not loaded');
                return false;
            }

            // Find the province in caraga.json using province code
            const province = Object.entries(this.caragaData["13"].province_list)
                .find(([_, data]) => data.province_code === provinceCode)?.[1];

            if (!province) {
                console.log(`Province ${provinceCode} not found in caraga.json`);
                return false;
            }

            // Get municipality coordinates and calculate center point
            const municipalities = Object.values(province.municipality_list);
            const validCoordinates = municipalities
                .filter(mun => mun.coordinates?.latitude && mun.coordinates?.longitude)
                .map(mun => ({
                    lat: parseFloat(mun.coordinates.latitude),
                    lng: parseFloat(mun.coordinates.longitude)
                }));

            if (validCoordinates.length === 0) {
                console.warn(`No valid coordinates found for province ${provinceCode}`);
                return false;
            }

            // Calculate province bounds with more precise boundaries
            const bounds = {
                north: Math.max(...validCoordinates.map(c => c.lat)) + 0.05,
                south: Math.min(...validCoordinates.map(c => c.lat)) - 0.05,
                east: Math.max(...validCoordinates.map(c => c.lng)) + 0.05,
                west: Math.min(...validCoordinates.map(c => c.lng)) - 0.05
            };

            // Calculate center point of the province
            const center = {
                lat: (bounds.north + bounds.south) / 2,
                lng: (bounds.east + bounds.west) / 2
            };

            // Calculate distance from point to center
            const distance = this.calculateDistance(
                lat, lng,
                center.lat, center.lng
            );

            // Calculate maximum allowed distance based on province size
            const maxDistance = this.calculateMaxDistance(bounds);

            console.log(`Province ${provinceCode} check:`, {
                point: [lat, lng],
                center: [center.lat, center.lng],
                distance: distance,
                maxDistance: maxDistance,
                bounds: bounds
            });

            // Check if point is within bounds AND within reasonable distance from center
            const isInBounds = lat <= bounds.north && 
                              lat >= bounds.south && 
                              lng <= bounds.east && 
                              lng >= bounds.west;

            const isWithinDistance = distance <= maxDistance;

            return isInBounds && isWithinDistance;

        } catch (error) {
            console.error('Error in isCoordinateInProvince:', error);
            return false;
        }
    }

    // Helper method to calculate distance between two points
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Radius of the earth in km
        const dLat = this.deg2rad(lat2 - lat1);
        const dLon = this.deg2rad(lon2 - lon1);
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c; // Distance in km
    }

    deg2rad(deg) {
        return deg * (Math.PI/180);
    }

    // Helper method to calculate maximum allowed distance based on province size
    calculateMaxDistance(bounds) {
        const width = this.calculateDistance(
            bounds.south, bounds.west,
            bounds.south, bounds.east
        );
        const height = this.calculateDistance(
            bounds.south, bounds.west,
            bounds.north, bounds.west
        );
        // Use the larger dimension as the maximum distance
        return Math.max(width, height) / 2;
    }

    // Add method to get province center from caraga.json
    getProvinceCenterFromCaraga(provinceCode) {
        try {
            const province = Object.values(this.caragaData["13"].province_list)
                .find(p => p.province_code === provinceCode);

            if (province?.coordinates) {
                return [
                    parseFloat(province.coordinates.latitude),
                    parseFloat(province.coordinates.longitude)
                ];
            }
            return null;
        } catch (error) {
            console.error('Error getting province center:', error);
            return null;
        }
    }

    async loadCoordinates() {
        try {
          const response = await fetch("rsc/coordinates.json");
          this.coordinates = await response.json();
    
          // Initialize map after loading coordinates
          this.initializeMap();
        } catch (error) {
          console.error("Failed to load coordinates:", error);
        }
      }
}

// Example usage
this.findTargetProvince(provinceData);

