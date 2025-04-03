class GeoJsonHandlers {
    constructor(map) {
        this.map = map;
        this.enabled = true;
        this.layers = new Map();
    }

    enableGeoJson() {
        try {
            this.enabled = true;
            console.log("Enabling GeoJSON layers...");

            this.layers.forEach((layer, code) => {
                if (layer && layer.setStyle) {
                    layer.setStyle({
                        ...this.getGeoJsonStyle(),
                        interactive: true,
                    });
                    console.log(`Enabled GeoJSON layer: ${code}`);
                }
            });

            this.map.invalidateSize();
            console.log("GeoJSON layers enabled successfully");
        } catch (error) {
            console.error("Error enabling GeoJSON layers:", error);
        }
    }

    disableGeoJson() {
        try {
            this.enabled = false;
            console.log("Disabling GeoJSON layers...");

            this.layers.forEach((layer, code) => {
                if (layer && layer.setStyle) {
                    // Remove tooltips
                    if (layer.getTooltip()) {
                        layer.unbindTooltip();
                    }

                    // Reset style and disable interactions
                    layer.setStyle({
                        fillOpacity: 0,
                        opacity: 0,
                        interactive: false,
                    });

                    // Remove event listeners
                    layer.off("mouseover");
                    layer.off("mouseout");
                    layer.off("click");

                    // Clear state
                    layer.isClicked = false;

                    console.log(`Disabled GeoJSON layer: ${code}`);
                }
            });

            this.map.invalidateSize();
            console.log("GeoJSON layers disabled successfully");
        } catch (error) {
            console.error("Error disabling GeoJSON layers:", error);
        }
    }

    addLayer(code, layer) {
        this.layers.set(code, layer);
        console.log(`Stored GeoJSON layer reference: ${code}`);
    }

    //- debugging for geojsonfiles -//
    initializeDebugPanel() {
        // Create debug panel if it doesn't exist
        // if (!document.getElementById('debug-panel')) {
        //     const debugPanel = document.createElement('div');
        //     debugPanel.id = 'debug-panel';
        //     debugPanel.innerHTML = `
        //         <h4>GeoJSON Debug Info</h4>
        //         <pre id="debug-content"></pre>
        //         <button onclick="this.parentElement.style.display='none'">Close</button>
        //     `;
        //     debugPanel.style.cssText = `
        //         position: fixed;
        //         bottom: 10px;
        //         right: 10px;
        //         z-index: 1000;
        //         background: rgba(0,0,0,0.8);
        //         color: white;
        //         padding: 10px;
        //         border-radius: 5px;
        //         max-height: 300px;
        //         overflow-y: auto;
        //         display: ${this.debug ? 'block' : 'none'};
        //     `;
        //     document.body.appendChild(debugPanel);
        // }
    }

    //- debugging for geojsonfiles close-//

    //- debugging for geojsonfiles using console-//
    // Update the existing log method
    log(message, data = null) {
        // if (this.debug) {
        //     const debugContent = document.getElementById('debug-content');
        //     const timestamp = new Date().toLocaleTimeString();
        //     const logMessage = `[${timestamp}] ${message} ${data ? JSON.stringify(data, null, 2) : ''}`;
        //     console.log(`[GeoJsonHandlers] ${logMessage}`);
        //     if (debugContent) {
        //         debugContent.innerHTML = logMessage + '\n' + debugContent.innerHTML;
        //     }
        // }
    }

    //- debugging for geojsonfiles using console close-//

    handleGeoJsonMouseOver(e, feature, layer, isMobile) {
        if (!this.enabled) return;
        try {
            this.log("Mouse over event", {
                feature,
                isMobile,
                isClicked: layer.isClicked,
            });

            if (!isMobile && !layer.isClicked) {
                layer.setStyle({
                    color: "#1671cb",
                    weight: 2,
                    fillOpacity: 0.3,
                    fillColor: "#2196f3",
                });

                if (feature.properties?.name && !layer.hoverTooltip) {
                    this.log("Creating tooltip for", feature.properties.name);
                    layer.hoverTooltip = L.tooltip({
                        permanent: true,
                        direction: "center",
                        className: "province-name-tooltip hover-tooltip",
                        offset: [0, 0],
                    })
                        .setContent(feature.properties.name)
                        .setLatLng(layer.getCenter());
                    layer.hoverTooltip.addTo(this.map);
                }
            }
        } catch (error) {
            console.error("Error in handleGeoJsonMouseOver:", error);
        }
    }

    handleGeoJsonMouseOut(e, layer, isMobile) {
        if (!this.enabled) return;
        try {
            this.log("Mouse out event", {
                isMobile,
                isClicked: layer.isClicked,
            });

            if (!isMobile && !layer.isClicked) {
                layer.setStyle(this.getGeoJsonStyle());
                if (layer.hoverTooltip) {
                    this.log("Removing hover tooltip");
                    layer.hoverTooltip.remove();
                    layer.hoverTooltip = null;
                }
            }
        } catch (error) {
            console.error("Error in handleGeoJsonMouseOut:", error);
        }
    }

    handleGeoJsonClick(e, feature, layer) {
        if (!this.enabled) return;
        try {
            this.log("Click event", {
                feature: feature.properties?.name,
                isClicked: layer.isClicked,
            });

            if (layer.isClicked) {
                this.deactivateGeoJsonLayer(layer);
            } else {
                this.activateGeoJsonLayer(feature, layer);
            }
        } catch (error) {
            console.error("Error in handleGeoJsonClick:", error);
        }
    }

    getGeoJsonStyle() {
        return {
            color: "transparent",
            weight: 0,
            fillOpacity: 0,
            fillColor: "transparent",
            className: "geojson-path",
            smoothFactor: 1.5,
            interactive: true,
            bubblingMouseEvents: false,
        };
    }

    deactivateGeoJsonLayer(layer) {
        if (!this.enabled) return;
        try {
            this.log("Deactivating layer");
            layer.isClicked = false;
            layer.setStyle(this.getGeoJsonStyle());
            if (layer.hoverTooltip) {
                this.log("Removing click tooltip");
                layer.hoverTooltip.remove();
                layer.hoverTooltip = null;
            }
        } catch (error) {
            console.error("Error in deactivateGeoJsonLayer:", error);
        }
    }

    activateGeoJsonLayer(feature, layer) {
        if (!this.enabled) return;
        try {
            this.log("Activating layer", feature.properties?.name);
            layer.isClicked = true;
            layer.setStyle({
                color: "#000000",
                weight: 3,
                fillOpacity: 0.5,
                fillColor: "#137dd1",
            });

            if (feature.properties?.name && !layer.hoverTooltip) {
                this.log("Creating click tooltip for", feature.properties.name);
                layer.hoverTooltip = L.tooltip({
                    permanent: true,
                    direction: "center",
                    className: "province-name-tooltip click-tooltip",
                    offset: [0, 0],
                })
                    .setContent(feature.properties.name)
                    .setLatLng(layer.getCenter());
                layer.hoverTooltip.addTo(this.map);
            }
        } catch (error) {
            console.error("Error in activateGeoJsonLayer:", error);
        }
    }

    // Utility method to check if layer is properly initialized
    validateLayer(layer) {
        if (!layer) {
            console.error("Layer is undefined");
            return false;
        }
        if (!layer.getCenter) {
            console.error("Layer missing getCenter method");
            return false;
        }
        return true;
    }
}

// Make the class globally available instead of using export
window.GeoJsonHandlers = GeoJsonHandlers;
