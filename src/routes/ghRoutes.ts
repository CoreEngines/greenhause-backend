import { Router } from "express";
import { createGreenHouse, getAllGreenHouses } from "../controllers/ghController";

const ghRouter = Router();

ghRouter.post("/create", createGreenHouse);
ghRouter.get("/all", getAllGreenHouses);

export default ghRouter;