import {Router} from "express";
import {AddFarmer, AddTechnician, getAllWorkers} from "../controllers/managerController";

const managerRoutes = Router();

managerRoutes.post("/add-farmer", AddFarmer);
managerRoutes.post("/add-technician", AddTechnician);
managerRoutes.get("/workers", getAllWorkers);

export default managerRoutes;
