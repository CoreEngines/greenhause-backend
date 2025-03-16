import { Router } from "express";
import {
    createGreenHouse,
    deleteGreenHouse,
    getGreenHouses,
    updateGreenHouse
} from "../controllers/greenhouseController";

const ghRouter = Router();

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

ghRouter.get("/all", getGreenHouses);

export default ghRouter;