class ReadingsChecker {
    static checkAllReadings(readings) {
        return {
            battery: this.checkBatteryStatus(
                readings.battery_voltage,
                readings.battery_soc,
                readings.battery_current
            ),
            solar: this.checkSolarStatus(
                readings.solar_voltage,
                readings.solar_current
            ),
            bulb: this.checkBulbStatus(
                readings.bulb_voltage,
                readings.bulb_current
            ),
        };
    }

    static checkBatteryStatus(voltage, soc, current) {
        const warnings = [];

        // If gikawat :D
        if (!voltage || !soc) {
            warnings.push({
                severity: "danger",
                message: "Battery sensor failure - No reading available",
                icon: "fa-triangle-exclamation",
            });
            return warnings;
        }

        // Voltage checks
        if (voltage < 10.5) {
            warnings.push({
                severity: "danger",
                message: "Critical: Battery voltage extremely low (<10.5V)",
                icon: "fa-triangle-exclamation",
            });
        } else if (voltage < 11.5) {
            warnings.push({
                severity: "warning",
                message: "Warning: Battery voltage low (<11.5V)",
                icon: "fa-exclamation-circle",
            });
        } else if (voltage > 14.4) {
            warnings.push({
                severity: "warning",
                message: "Warning: Battery voltage too high (>14.4V)",
                icon: "fa-bolt",
            });
        }

        console.log(voltage, soc, current);

        // SOC checks
        if (soc < 20) {
            warnings.push({
                severity: "danger",
                message: "Critical: State of Charge critically low (<20%)",
                icon: "fa-battery-empty",
            });
        } else if (soc < 60) {
            warnings.push({
                severity: "warning",
                message: "Warning: State of Charge low (<60%)",
                icon: "fa-battery-quarter",
            });
        }

        return warnings;
    }

    static checkSolarStatus(voltage, current) {
        const warnings = [];

        // If gikawat :D
        if (!voltage || !current) {
            warnings.push({
                severity: "danger",
                message: "Solar panel sensor failure - No reading available",
                icon: "fa-triangle-exclamation",
            });
            return warnings;
        }

        // Check for no solar output during daytime
        if (this.isDaytime() && voltage < 5) {
            warnings.push({
                severity: "warning",
                message: "Solar panel not generating power during daytime",
                icon: "fa-sun",
            });
        }

        // Check for unusually high voltage
        if (voltage > 25) {
            warnings.push({
                severity: "warning",
                message: "Solar panel voltage too high (>25V)",
                icon: "fa-bolt",
            });
        }

        return warnings;
    }

    static checkBulbStatus(voltage, current) {
        const warnings = [];

        // If gikawat :D

        console.log(voltage, current);

        if (!voltage || !current) {
            warnings.push({
                severity: "danger",
                message: "Bulb sensor failure - No reading available",
                icon: "fa-triangle-exclamation",
            });
            return warnings;
        }

        // Check for bulb failure
        if (voltage > 0 && current === 0) {
            warnings.push({
                severity: "danger",
                message: "Bulb may be damaged - No current flow detected",
                icon: "fa-lightbulb",
            });
        }

        // Check for unusual voltage
        if (voltage > 12.5) {
            warnings.push({
                severity: "warning",
                message: "Bulb voltage too high (>12.5V)",
                icon: "fa-bolt",
            });
        }

        return warnings;
    }

    static isDaytime() {
        const hour = new Date().getHours();
        return hour >= 6 && hour <= 18;
    }

    static createWarningsHTML(allWarnings) {
        const sections = [];

        if (allWarnings.battery.length > 0) {
            sections.push(
                this.createWarningSection("Battery Status", allWarnings.battery)
            );
        }

        if (allWarnings.solar.length > 0) {
            sections.push(
                this.createWarningSection(
                    "Solar Panel Status",
                    allWarnings.solar
                )
            );
        }

        if (allWarnings.bulb.length > 0) {
            sections.push(
                this.createWarningSection("Bulb Status", allWarnings.bulb)
            );
        }

        return sections.length > 0 ? sections.join('<hr class="my-2">') : "";
    }

    static createWarningSection(title, warnings) {
        return `
            <div class="warning-section mb-2">
                <h6 class="text-muted mb-2">${title}</h6>
                ${warnings
                    .map(
                        (warning) => `
                    <div class="alert alert-${warning.severity} d-flex align-items-center mb-2" role="alert">
                        <i class="fas ${warning.icon} me-2"></i>
                        <div>${warning.message}</div>
                    </div>
                `
                    )
                    .join("")}
            </div>
        `;
    }
}
