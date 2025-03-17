import {Router} from "express";
import {
    createGreenHouse,
    deleteGreenHouse,
    getGreenHouses,
    updateGreenHouse
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

export default ghRouter;