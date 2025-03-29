import {Response} from "express";
import Greenhouse from "../models/greenHouses";
import mqtt from "mqtt";
import {ws} from "../app";

const connectedDevices: Record<string, mqtt.MqttClient> = {};

export async function ConnectToDevice(greenHouseId: string, res: Response) {
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

        mqttClient.on("message", (topic, message) => {
            console.log(`[MQTT] Data received from ${topic}:`, message.toString());

            const sensorData = message.toString();

            // Establish a websocket connection
            ws.emit("sensorData", {data: sensorData});
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