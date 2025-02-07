import { Router } from "express";
import { forgotPassword, resetPassword, signUp, singIn } from "../controllers/authController";
import { validateRequestBody, signUpSchema, email } from "../validators/authValidator";
import passport from "passport";

const unAuthRouter = Router();

unAuthRouter.post("/sign-in", validateRequestBody(email),singIn);
unAuthRouter.post("/sign-up", validateRequestBody(signUpSchema),signUp);
unAuthRouter.post("/forogt-password", validateRequestBody(email),forgotPassword);
unAuthRouter.post("/reset-password", resetPassword);

unAuthRouter.get(
    "/google", 
    passport.authenticate(
        'google', 
        { scope: ["profile", "email"] },
    ),
);

unAuthRouter.get(
    "/google/callback",
    passport.authenticate("google", { session: false }), 
    (req, res) => {
      res.redirect("/");
    }
  );

export default unAuthRouter;