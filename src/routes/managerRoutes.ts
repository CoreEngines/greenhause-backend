import {Router} from "express";
import {AddFarmer, AddTechnician, getAllWorkers} from "../controllers/managerController";
import {removeWorkerFromGreenhouse} from "../controllers/greenhouseController";

const managerRoutes = Router();

/**
 * @swagger
 * /manager/add-farmer:
 *   post:
 *     summary: Add a farmer
 *     tags: [Manager]
 *     description: Adds a farmer to the system
 *     responses:
 *       200:
 *         description: Farmer added successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
managerRoutes.post("/add-farmer", AddFarmer);

/**
 * @swagger
 * /manager/add-technician:
 *   post:
 *     summary: Add a technician
 *     tags: [Manager]
 *     description: Adds a technician to the system
 *     responses:
 *       200:
 *         description: Technician added successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 *
 *
 */
managerRoutes.post("/add-technician", AddTechnician);

/**
 * @swagger
 * /manager/workers:
 *   get:
 *     summary: Get all workers
 *     tags: [Manager]
 *     description: Retrieves a list of all workers
 *     responses:
 *       200:
 *         description: List of workers retrieved successfully
 *       500:
 *         description: Internal server error
 */
managerRoutes.get("/workers", getAllWorkers);

/**
 * @swagger
 * /manager/remove-worker:
 *   post:
 *     summary: Remove a worker from a greenhouse
 *     tags: [Manager]
 *     description: Removes a farmer or technician from a greenhouse
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - greenhouseId
 *               - workerId
 *               - workerType
 *             properties:
 *               greenhouseId:
 *                 type: string
 *                 description: The ID of the greenhouse
 *               workerId:
 *                 type: string
 *                 description: The ID of the worker to remove
 *               workerType:
 *                 type: string
 *                 enum: [farmer, technician]
 *                 description: The type of worker to remove
 *     responses:
 *       200:
 *         description: Worker removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Worker removed successfully"
 *       400:
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
 *                     missingFields: "Missing required fields"
 *                     invalidType: "Invalid worker type"
 *                     unauthorized: "Unauthorized"
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Unauthorized to modify this greenhouse"
 *       404:
 *         description: Not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   examples:
 *                     notFound: "Greenhouse not found"
 *                     workerNotFound: "Worker not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to remove worker"
 */
managerRoutes.post("/remove-worker", removeWorkerFromGreenhouse);

export default managerRoutes;
