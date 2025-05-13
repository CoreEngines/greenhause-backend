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

export async function generateDataInThreshold(greenHouse: { thresholds: Thresholds }) {
    const thresholds: Thresholds = greenHouse.thresholds;
    const generatedData: SensorData = {
        temperature: 0,
        humidity: 0,
        ph: 0,
        soilMoisture: 0,
    };

    for (const key of ["temperature", "humidity", "ph", "soilMoisture"] as const) {
        const threshold = thresholds[key];
        if (!threshold) continue;

        // Calculate the middle of the threshold interval
        const middleValue = threshold.min != null && threshold.max != null
            ? (threshold.min + threshold.max) / 2
            : null;

        // If no valid threshold, skip
        if (middleValue === null) continue;

        // Randomly choose to be +1 or -1 from the middle
        const randomOffset = Math.random() < 0.5 ? 1 : -1;

        // Generate the random value
        generatedData[key] = middleValue + randomOffset;
    }

    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log(generatedData);
    return JSON.stringify(generatedData);
}

export async function convertSensorDataToJson(rawData: string) {
    const validJsonString = rawData.replace(/'/g, '"');
    const jsonData: SensorData = await JSON.parse(validJsonString);
    return jsonData;
}