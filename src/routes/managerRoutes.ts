import {Router} from "express";
import {AddFarmer, AddTechnician, getAllWorkers} from "../controllers/managerController";

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

export default managerRoutes;
