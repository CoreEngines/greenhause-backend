import { Router } from "express";
import { AddFarmer, AddTechnician } from "../controllers/managerController";

const managerRoutes = Router();

managerRoutes.post("/add-farmer", AddFarmer);
managerRoutes.post("/add-technician", AddTechnician);

export default managerRoutes;
