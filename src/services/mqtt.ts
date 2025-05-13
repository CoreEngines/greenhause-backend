import {Response} from "express";
import Greenhouse from "../models/greenHouses";
import mqtt from "mqtt";
import {actuatorStates, ws} from "../app";
import GreenHouseStats from "../models/greenHouseStats";
import {validateSensorData} from "../utils/guard";

export interface SensorData {
    temperature: number;
    humidity: number;
    soilMoisture: number;
    ph: number;
}

export interface ThresholdValue {
    min?: number | null | undefined;
    max?: number | null | undefined;
}

export interface Thresholds {
    temperature?: ThresholdValue;
    humidity?: ThresholdValue;
    soilMoisture?: ThresholdValue;
    ph?: ThresholdValue;
}

const connectedDevices: Record<string, mqtt.MqttClient> = {};
const lastSaveTimes: Record<string, number> = {};

export async function ConnectToDevice(greenHouseId: string, res: Response) {
    try {
        const greenHouse = await Greenhouse.findOne({_id: greenHouseId});
        if (!greenHouse) {
            console.log("[MQTT] Green house doesn't exist");
            res.status(400).json({error: "Green house doesn't exist"});
            return;
        }


        const {deviceUrl} = greenHouse;
        if (!deviceUrl) {
            res.status(400).json({error: "Green house doesn't have device url"});
            return;
        }

        if (connectedDevices[deviceUrl]) {
            console.log("[MQTT] Device is already connected");
            res.status(400).json({error: "Device is already connected"});
            return;
        }

        // connect to mqtt
        console.log(`[MQTT] Connecting to device: ${deviceUrl}`);
        const mqttClient = mqtt.connect(deviceUrl);

        mqttClient.on("connect", () => {
            console.log(`[MQTT] Connected to ${deviceUrl}`);
            const topic = `greenhouse/${greenHouseId}/data`;

            mqttClient.subscribe(topic, (err) => {
                if (err) console.error(`[MQTT] Subscription error: ${err}`);
                else console.log(`[MQTT] Subscribed to ${topic}`);
            });
        });

        mqttClient.on("message", async (topic, message) => {
            // console.log(`[MQTT] Data received from ${topic}:`, message.toString());

            const rawSensorData = message.toString();
            const validJsonString = rawSensorData.replace(/'/g, '"');
            const jsonData: SensorData = await JSON.parse(validJsonString); // Convert sensorData to json

            // @ts-expect-error - greenHouse.thresholds is dynamically typed and may not match Thresholds interface exactly
            const thresholds: Thresholds = greenHouse.thresholds;
            await validateSensorData(thresholds, greenHouseId, jsonData);

            const isActuatorEnabled = actuatorStates[greenHouseId] || false;

            if (!isActuatorEnabled) {
                ws.emit("sensorData", {data: rawSensorData});
            } else {
                const fixedSensorData = {
                    temperature: 10,
                    humidity: 30,
                    soilMoisture: 30,
                    ph: 4
                };
                const rawData = JSON.stringify(fixedSensorData);
                ws.emit("sensorData", {data: rawData});
            }

            // Check if we should save to database (once per hour)
            const now = Date.now();
            const lastSave = lastSaveTimes[greenHouseId] || 0;
            const duration = 60 * 1000; // 1 min

            if (now - lastSave >= duration) {
                // Save to database
                const statsRecord = new GreenHouseStats({
                    greenHouseId,
                    temperature: jsonData.temperature,
                    humidity: jsonData.humidity,
                    soilMoisture: jsonData.soilMoisture,
                    ph: jsonData.ph
                });

                await statsRecord.save();
                // TODO: Notify users every time a new record is saved
                console.log(`[DB] Saved hourly stats for greenhouse ${greenHouseId}`);

                // Update last save time
                lastSaveTimes[greenHouseId] = now;
            }
        });

        mqttClient.on("error", (err) => console.error("[MQTT] Error:", err));
        mqttClient.on("close", () => console.log("[MQTT] Disconnected from", deviceUrl));

        connectedDevices[deviceUrl] = mqttClient;

    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Internal Server Error"});
        return
    }
}

export async function disconnectFromDevice(greenHouseId: string, res: Response) {
    try {
        const greenHouse = await Greenhouse.findOne({_id: greenHouseId});
        if (!greenHouse) {
            res.status(400).json({error: "Green house doesn't exist"});
            console.log("[MQTT] Green house doesn't exist");
            return;
        }

        const {deviceUrl} = greenHouse;
        if (!deviceUrl) {
            res.status(400).json({error: "Green house doesn't have device url"});
            return;
        }

        if (!connectedDevices[deviceUrl]) {
            console.log("[MQTT] Device is not connected");
            res.status(400).json({error: "Device is not connected"});
            return;
        }

        // Get the MQTT client and disconnect
        const mqttClient = connectedDevices[deviceUrl];

        mqttClient.end(true, () => {
            console.log(`[MQTT] Disconnected from ${deviceUrl}`);
            delete connectedDevices[deviceUrl];
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Internal Server Error"});
        return;
    }
}