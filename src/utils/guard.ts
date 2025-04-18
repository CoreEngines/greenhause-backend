import {SensorData, Thresholds} from "../services/mqtt";
import {ws} from "../app";

export async function validateSensorData(
    thresholds: Thresholds,
    greenHouseId: string,
    data: SensorData
) {
    for (const key of ["temperature", "humidity", "soilMoisture", "ph"] as const) {
        const value = data[key];
        const threshold = thresholds[key];
        if (!threshold) continue;

        let message = "";

        if (threshold.max != null && value > threshold.max) {
            message = `${key} is above max threshold: ${value} > ${threshold.max}`;
        }

        if (threshold.min != null && value < threshold.min) {
            message = `${key} is below min threshold: ${value} < ${threshold.min}`;
        }

        if (message) {

            ws.emit("alert", {
                greenhouseId: greenHouseId,
                type: key,
                value,
                threshold,
                message,
            });

            console.log(`[ALERT] ${message}`);
        }
    }
}