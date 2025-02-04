import { Router } from "express";
import { forgotPassword, resetPassword, signUp, singIn } from "../controllers/authController";

const unAuthRouter = Router();

unAuthRouter.post("/sign-in", singIn);
unAuthRouter.post("/sign-up", signUp);
unAuthRouter.post("/forogt-password", forgotPassword);
unAuthRouter.post("/reset-password", resetPassword);

export default unAuthRouter;