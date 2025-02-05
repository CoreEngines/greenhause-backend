import { Router } from "express";
import { forgotPassword, resetPassword, signUp, singIn } from "../controllers/authController";
import { validateRequestBody, signUpSchema, email } from "../validators/authValidator";

const unAuthRouter = Router();

unAuthRouter.post("/sign-in", validateRequestBody(email),singIn);
unAuthRouter.post("/sign-up", validateRequestBody(signUpSchema),signUp);
unAuthRouter.post("/forogt-password", validateRequestBody(email),forgotPassword);
unAuthRouter.post("/reset-password", resetPassword);

export default unAuthRouter;