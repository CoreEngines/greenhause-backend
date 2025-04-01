import {Router} from "express";
import {
    connectToGreenHouse,
    createGreenHouse,
    deleteGreenHouse, disconnectFromGreenHouse,
    getGreenHouses, getGreenHouseWorkers,
    updateGreenHouse
} from "../controllers/greenhouseController";
import {getAllWorkers} from "../controllers/managerController";

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

export default ghRouter;