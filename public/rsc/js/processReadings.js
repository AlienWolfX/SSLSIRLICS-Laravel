class ReadingsChecker {
    static checkAllReadings(readings, historicalReadings = []) {
        return {
            errorCodes: this.getErrorCodes(readings, historicalReadings),
        };
    }

    static isDaytime() {
        const hour = new Date().getHours();
        return hour >= 6 && hour <= 18;
    }

    static getErrorCodes(readings, historicalReadings = []) {
        const errors = [];

        // Error 212: Bulb not working at night
        if (
            !this.isDaytime() &&
            readings.bulb_current === 0 &&
            readings.bulb_voltage === 0
        ) {
            errors.push("212");
        }

        // Error 111: Bulb on during daytime
        // if (this.isDaytime() && readings.bulb_current == 0) {
        //     errors.push("111");
        // }

        // Error 311: Solar panel connection issue
        if (
            this.isDaytime() &&
            (readings.solar_voltage === 0 || readings.solar_current === 0)
        ) {
            errors.push("311");
        }

        // Error 312: Three consecutive days power drop
        if (this.checkConsecutiveDaysPowerDrop(historicalReadings)) {
            errors.push("312");
        }

        // Error 313: Three consecutive days irregular power
        if (this.checkConsecutiveDaysIrregularPower(historicalReadings)) {
            errors.push("313");
        }

        // Error 314: Battery charging too quickly
        if (this.checkRapidCharging(readings, historicalReadings)) {
            errors.push("314");
        }

        // Error 305: SOC value jumps
        if (historicalReadings.length > 0) {
            const lastReading =
                historicalReadings[historicalReadings.length - 1];
            if (Math.abs(readings.battery_soc - lastReading.battery_soc) > 20) {
                errors.push("305");
            }
        }

        // Error 306: Zero SOC for 3 nights
        if (
            !this.isDaytime() &&
            this.checkConsecutiveZeroSoc(historicalReadings)
        ) {
            errors.push("306");
        }

        // Error 317: Zero SOC for 3 days
        if (
            this.isDaytime() &&
            this.checkConsecutiveZeroSoc(historicalReadings)
        ) {
            errors.push("317");
        }

        // Error 308: 100% SOC for 3 nights
        if (
            !this.isDaytime() &&
            this.checkConsecutiveFullSoc(historicalReadings)
        ) {
            errors.push("308");
        }

        // Error 319: 100% SOC for 3 days
        if (
            this.isDaytime() &&
            this.checkConsecutiveFullSoc(historicalReadings)
        ) {
            errors.push("319");
        }

        // Error 300: Quick discharge at night
        if (!this.isDaytime() && readings.battery_soc < 20) {
            errors.push("300");
        }

        // Error 400: No component data
        if (
            !readings.battery_voltage &&
            !readings.solar_voltage &&
            !readings.bulb_voltage
        ) {
            errors.push("400");
        }

        return errors;
    }

    static checkConsecutiveDaysPowerDrop(readings) {
        if (readings.length < 72) return false; // Need 3 days of data
        const dayReadings = this.groupByDay(readings);
        if (dayReadings.length < 3) return false;

        const dailyAverages = dayReadings
            .slice(-3)
            .map(
                (day) =>
                    day.reduce((sum, r) => sum + r.solar_current, 0) /
                    day.length
            );

        return (
            dailyAverages[2] < dailyAverages[1] &&
            dailyAverages[1] < dailyAverages[0]
        );
    }

    static checkConsecutiveDaysIrregularPower(readings) {
        if (readings.length < 72) return false;
        const dayReadings = this.groupByDay(readings);
        if (dayReadings.length < 3) return false;

        return dayReadings.slice(-3).every((day) => {
            const values = day.map((r) => r.solar_current);
            const avg = values.reduce((a, b) => a + b) / values.length;
            const variance =
                values.reduce((a, b) => a + Math.pow(b - avg, 2), 0) /
                values.length;
            return variance > 2;
        });
    }

    static checkRapidCharging(currentReading, historicalReadings) {
        if (historicalReadings.length < 8) return false; // Need at least 2 hours of data
        const chargingStartIndex = historicalReadings.findIndex(
            (r) => r.battery_soc < 90
        );
        if (chargingStartIndex === -1) return false;

        const timeToCharge = chargingStartIndex * 15; // 15 minutes between readings
        return timeToCharge <= 120; // 2 hours or less
    }

    static checkConsecutiveZeroSoc(readings) {
        if (readings.length < 72) return false;
        const dayReadings = this.groupByDay(readings);
        if (dayReadings.length < 3) return false;

        return dayReadings
            .slice(-3)
            .every((day) => day.some((reading) => reading.battery_soc === 0));
    }

    static checkConsecutiveFullSoc(readings) {
        if (readings.length < 72) return false;
        const dayReadings = this.groupByDay(readings);
        if (dayReadings.length < 3) return false;

        return dayReadings
            .slice(-3)
            .every((day) => day.some((reading) => reading.battery_soc === 100));
    }

    static groupByDay(readings) {
        const days = [];
        for (let i = 0; i < readings.length; i += 24) {
            days.push(readings.slice(i, Math.min(i + 24, readings.length)));
        }
        return days;
    }

    static async createWarningsHTML(allWarnings) {
        if (!allWarnings.errorCodes || allWarnings.errorCodes.length === 0) {
            return `
                <div class="text-center text-muted py-3">
                    <i class="fas fa-check-circle me-2"></i>No active warnings
                </div>
            `;
        }

        try {
            const response = await fetch(
                `/api/v1/error-codes?codes=${allWarnings.errorCodes.join(",")}`
            );
            const errors = await response.json();

            return `
                <div class="warning-section">
                    ${errors
                        .map(
                            (error) => `
                        <div class="alert alert-warning d-flex align-items-center mb-2" role="alert">
                            <i class="fas fa-exclamation-triangle me-2"></i>
                            <div>
                                <strong>Error ${error.error_code}:</strong> ${error.problem}
                                <br>
                                <small class="text-muted">Action: ${error.action}</small>
                            </div>
                        </div>
                    `
                        )
                        .join("")}
                </div>
            `;
        } catch (error) {
            console.error("Error fetching error codes:", error);
            return "";
        }
    }
}
