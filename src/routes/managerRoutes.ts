import {Router} from "express";
import {AddFarmer, AddTechnician, getAllWorkers} from "../controllers/managerController";
import {removeFarmer, removeTechnician} from "../controllers/managerController";

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
 * /manager/remove-farmer:
 *   post:
 *     summary: Remove a farmer
 *     tags: [Manager]
 *     description: Removes a farmer from a greenhouse and deactivates their account.
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
 *                 description: ID of the greenhouse from which the farmer is to be removed.
 *                 example: "64ac123e4305d1a12bc56789"
 *               workerId:
 *                 type: string
 *                 description: ID of the farmer to be removed.
 *                 example: "64bce2d5305d1b22cf456789"
 *               workerType:
 *                 type: string
 *                 enum: [farmer]
 *                 description: Type of worker to be removed (must be "farmer").
 *                 example: "farmer"
 *     responses:
 *       200:
 *         description: Farmer removed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Farmer removed successfully"
 *       400:
 *         description: Bad request. Missing or invalid fields, or unauthorized action.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Missing required fields"
 *       403:
 *         description: Forbidden. Manager not authorized to modify this greenhouse.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Unauthorized to modify this greenhouse"
 *       404:
 *         description: Not found. Greenhouse or farmer not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Farmer not found"
 *       500:
 *         description: Internal server error.
 */
managerRoutes.post("/remove-farmer", removeFarmer);

/**
 * @swagger
 * /manager/remove-technician:
 *   post:
 *     summary: Remove a technician
 *     tags: [Manager]
 *     description: Removes a technician from a greenhouse and deactivates their account.
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
 *                 description: ID of the greenhouse from which the technician is to be removed.
 *                 example: "64de234f4305d1a45af78912"
 *               workerId:
 *                 type: string
 *                 description: ID of the technician to be removed.
 *                 example: "64cfe3a6305d1b33da567123"
 *               workerType:
 *                 type: string
 *                 enum: [technician]
 *                 description: Type of worker to be removed (must be "technician").
 *                 example: "technician"
 *     responses:
 *       200:
 *         description: Technician removed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Technician removed successfully"
 *       400:
 *         description: Bad request. Missing or invalid fields, or unauthorized action.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Missing required fields"
 *       403:
 *         description: Forbidden. Manager not authorized to modify this greenhouse.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Unauthorized to modify this greenhouse"
 *       404:
 *         description: Not found. Greenhouse or technician not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Technician not found"
 *       500:
 *         description: Internal server error.
 */
managerRoutes.post("/remove-technician", removeTechnician);

export default managerRoutes;
