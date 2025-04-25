import {Router} from "express";
import {
    AddDeviceToGreenHouse,
    addSensorToGreenHouse,
    connectToGreenHouse,
    createGreenHouse,
    deleteGreenHouse,
    disconnectFromGreenHouse,
    getAvgDailyStats,
    getGreenHouses,
    getGreenHouseSensors,
    getGreenHouseStats,
    getGreenHouseWorkers,
    seedFakeStats,
    updateGreenHouse,
    updateThresholds
} from "../controllers/greenhouseController";

const ghRouter = Router();

/**
 * @swagger
 * /green-houses/create:
 *   post:
 *     summary: Create a new green house
 *     tags: [Greenhouse]
 *     description: Creates a new green house
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GreenHouse'
 *     responses:
 *       201:
 *         description: Green house created successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
ghRouter.post("/create", createGreenHouse);

/**
 *
 * @swagger
 * /green-houses/set-thresholds:
 *   post:
 *     summary: Set thresholds for a green house
 *     tags: [Greenhouse]
 *     description: Sets the thresholds for a green house
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               greenHouseId:
 *                 type: string
 *                 description: The ID of the green house
 *               temperature_min:
 *                 type: number
 *                 description: Minimum temperature threshold
 *               temperature_max:
 *                 type: number
 *                 description: Maximum temperature threshold
 *               humidity_min:
 *                 type: number
 *                 description: Minimum humidity threshold
 *               humidity_max:
 *                 type: number
 *                 description: Maximum humidity threshold
 *               soilMoisture_min:
 *                 type: number
 *                 description: Minimum soil moisture threshold
 *               soilMoisture_max:
 *                 type: number
 *                 description: Maximum soil moisture threshold
 *               ph_min:
 *                 type: number
 *                 description: Minimum pH level threshold
 *               ph_max:
 *                 type: number
 *                 description: Maximum pH level threshold
 *     responses:
 *       200:
 *         description: Thresholds set successfully
 *       400:
 *         description: Bad request - Missing fields
 *       500:
 *         description: Internal server error
 */
ghRouter.post("/set-thresholds", updateThresholds);


/**
 * @swagger
 * /green-houses/update:
 *   post:
 *     summary: Update a green house
 *     tags: [Greenhouse]
 *     description: let's the manager update greenhouses that they own
 *     responses:
 *       200:
 *         description: green house updated successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Green house updated successfully"
 *       500:
 *         description: Internal server error
 */
ghRouter.post("/update", updateGreenHouse);

/**
 * @swagger
 * /green-houses/delete:
 *   post:
 *     summary: deletes a green house
 *     tags: [Greenhouse]
 *     description: let's the manager delete greenhouses that they own
 *     responses:
 *       200:
 *         description: green house deleted successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Green house deleted successfully"
 *       500:
 *         description: Internal server error
 */
ghRouter.post("/delete", deleteGreenHouse);

/**
 * @swagger
 * /green-houses/all:
 *   get:
 *     summary: Get all green houses
 *     tags: [Greenhouse]
 *     description: Retrieves a list of all green houses
 *     responses:
 *       200:
 *         description: List of green houses retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/GreenHouse'
 *       500:
 *         description: Internal server error
 */
ghRouter.get("/all", getGreenHouses);

/**
 * @swagger
 * /green-houses/connect:
 *   post:
 *     tags:
 *       - Greenhouse
 *     summary: Connect to a greenhouse device
 *     description: Establishes an MQTT connection to a specific greenhouse device and subscribes to its data topic
 *     operationId: connectToGreenHouse
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - greenHouseId
 *             properties:
 *               greenHouseId:
 *                 type: string
 *                 format: uuid
 *                 example: "507f1f77bcf86cd799439011"
 *                 description: The ID of the greenhouse to connect to
 *     responses:
 *       '200':
 *         description: Successfully connected to the greenhouse device
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Connected to GreenHouse device"
 *       '400':
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   examples:
 *                     noToken: "No access token provided"
 *                     invalidToken: "Invalid access token"
 *                     unauthorized: "Unauthorized"
 *                     missingFields: "Missing fields"
 *                     notExist: "Green house doesn't exist"
 *                     noUrl: "Green house doesn't have device url"
 *                     alreadyConnected: "Device is already connected"
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   examples:
 *                     connectionFailed: "Failed to connect to GreenHouse device"
 *                     serverError: "Internal Server Error"
 */
ghRouter.post("/connect", connectToGreenHouse);
/**
 * @swagger
 * /green-houses/disconnect:
 *   post:
 *     tags:
 *       - Greenhouse
 *     summary: Disconnect from a greenhouse device
 *     description: Disconnects the MQTT connection to a specific greenhouse device
 *     operationId: disconnectFromGreenHouse
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - greenHouseId
 *             properties:
 *               greenHouseId:
 *                 type: string
 *                 format: uuid
 *                 example: "507f1f77bcf86cd799439011"
 *                 description: The ID of the greenhouse to disconnect from
 *     responses:
 *       '200':
 *         description: Successfully disconnected from the greenhouse device
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Disconnected from GreenHouse device"
 *       '400':
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   examples:
 *                     noToken: "No access token provided"
 *                     invalidToken: "Invalid access token"
 *                     unauthorized: "Unauthorized"
 *                     missingFields: "Missing fields"
 *                     notExist: "Green house doesn't exist"
 *                     noUrl: "Green house doesn't have device url"
 *                     notConnected: "Device is not connected"
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to disconnect from GreenHouse device"
 */
ghRouter.post("/disconnect", disconnectFromGreenHouse);

/**
 * @swagger
 * /green-houses/workers:
 *   post:
 *     summary: Get Greenhouse Workers
 *     description: Fetches the list of farmers and technicians associated with a greenhouse.
 *     tags:
 *       - Greenhouse
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               greenHouseId:
 *                 type: string
 *                 description: The ID of the greenhouse.
 *     responses:
 *       200:
 *         description: Successfully retrieved greenhouse workers.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 farmers:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       email:
 *                         type: string
 *                       role:
 *                         type: string
 *                 technicians:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       email:
 *                         type: string
 *                       role:
 *                         type: string
 *       400:
 *         description: Invalid request parameters or unauthorized access.
 *       404:
 *         description: Greenhouse not found.
 *       500:
 *         description: Internal server error.
 */
ghRouter.post("/workers", getGreenHouseWorkers);

/**
 * @swagger
 * /green-houses/seed:
 *   post:
 *     summary: Seed fake stats for a greenhouse
 *     tags: [Greenhouse]
 *     description: Seeds fake statistics data for testing purposes.
 *     responses:
 *       200:
 *         description: Fake stats seeded successfully.
 *       500:
 *         description: Internal server error.
 */
ghRouter.post("/seed", seedFakeStats);

/**
 * @swagger
 * /green-houses/get-stats:
 *   post:
 *     summary: Get greenhouse stats
 *     tags: [Greenhouse]
 *     description: Retrieves statistics for a specific greenhouse.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               greenHouseId:
 *                 type: string
 *                 description: The ID of the greenhouse.
 *     responses:
 *       200:
 *         description: Successfully retrieved greenhouse stats.
 *       400:
 *         description: Bad request - Missing or invalid fields.
 *       404:
 *         description: No stats found for the greenhouse.
 *       500:
 *         description: Internal server error.
 */
ghRouter.post("/get-stats", getGreenHouseStats);

/**
 * @swagger
 * /green-houses/avg:
 *   post:
 *     summary: Get average daily stats
 *     tags: [Greenhouse]
 *     description: Retrieves the average daily statistics for a specific greenhouse.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               greenHouseId:
 *                 type: string
 *                 description: The ID of the greenhouse.
 *     responses:
 *       200:
 *         description: Successfully retrieved average daily stats.
 *       400:
 *         description: Bad request - Missing or invalid fields.
 *       404:
 *         description: Greenhouse not found.
 *       500:
 *         description: Internal server error.
 */
ghRouter.post("/avg", getAvgDailyStats);

/**
 * @swagger
 * /green-houses/add-device:
 *   post:
 *     summary: Add a device to a greenhouse
 *     tags: [Greenhouse]
 *     description: Associates a new device with a specific greenhouse.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               greenHouseId:
 *                 type: string
 *                 description: The ID of the greenhouse.
 *               deviceId:
 *                 type: string
 *                 description: The ID of the device to add.
 *     responses:
 *       200:
 *         description: Device added successfully.
 *       400:
 *         description: Bad request - Missing or invalid fields.
 *       404:
 *         description: Greenhouse or device not found.
 *       500:
 *         description: Internal server error.
 */
ghRouter.post("/add-device", AddDeviceToGreenHouse);

/**
 * @swagger
 * /green-houses/add-sensor:
 *   post:
 *     summary: Add a sensor to a greenhouse
 *     tags: [Greenhouse]
 *     description: Adds a sensor with technical specifications to a specific greenhouse.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - greenHouseId
 *               - name
 *               - type
 *               - quantity
 *             properties:
 *               greenHouseId:
 *                 type: string
 *                 description: The ID of the greenhouse.
 *               name:
 *                 type: string
 *                 description: Name of the sensor.
 *               type:
 *                 type: string
 *                 description: Type of the sensor.
 *               quantity:
 *                 type: number
 *                 description: Quantity of sensors to add.
 *               voltageRange:
 *                 type: string
 *                 description: Voltage range required for the sensor.
 *               maxCurrent:
 *                 type: number
 *                 description: Maximum current in amps.
 *               minTemperature:
 *                 type: number
 *                 description: Minimum temperature the sensor can measure.
 *               maxTemperature:
 *                 type: number
 *                 description: Maximum temperature the sensor can measure.
 *               accuracyTemperature:
 *                 type: number
 *                 description: Accuracy of temperature measurement.
 *               minHumidity:
 *                 type: number
 *                 description: Minimum humidity the sensor can measure.
 *               maxHumidity:
 *                 type: number
 *                 description: Maximum humidity the sensor can measure.
 *               accuracyHumidity:
 *                 type: number
 *                 description: Accuracy of humidity measurement.
 *               samplingRate:
 *                 type: number
 *                 description: Sampling rate in Hz.
 *               physicalDimensions_length:
 *                 type: number
 *                 description: Physical length of the sensor.
 *               physicalDimensions_width:
 *                 type: number
 *                 description: Physical width of the sensor.
 *               physicalDimensions_height:
 *                 type: number
 *                 description: Physical height of the sensor.
 *               physicalDimensions_unit:
 *                 type: string
 *                 description: Unit of measurement for physical dimensions (e.g., cm, mm).
 *               pinConfiguration_count:
 *                 type: number
 *                 description: Number of pins in the sensor.
 *               pinConfiguration_spacing:
 *                 type: number
 *                 description: Spacing between pins.
 *     responses:
 *       200:
 *         description: Sensor added successfully.
 *       400:
 *         description: Bad request - Missing or invalid fields.
 *       404:
 *         description: Greenhouse or sensor not found.
 *       500:
 *         description: Internal server error.
 */
ghRouter.post("/add-sensor", addSensorToGreenHouse);

/**
 * @swagger
 * /green-houses/get-sensors:
 *   post:
 *     summary: Get sensors for a greenhouse
 *     tags: [Greenhouse]
 *     description: Retrieves all sensors associated with a specific greenhouse.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               greenHouseId:
 *                 type: string
 *                 description: The ID of the greenhouse.
 *     responses:
 *       200:
 *         description: Successfully retrieved greenhouse sensors.
 *       400:
 *         description: Bad request - Missing or invalid fields.
 *       404:
 *         description: Greenhouse not found.
 */
ghRouter.post("/get-sensors", getGreenHouseSensors);

export default ghRouter;