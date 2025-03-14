import { Router } from "express";
import { createGreenHouse, deleteGreenHouse, getAllGreenHouses, updateGreenHouse } from "../controllers/ghController";

const ghRouter = Router();

ghRouter.post("/create", createGreenHouse);


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

ghRouter.get("/all", getAllGreenHouses);

export default ghRouter;