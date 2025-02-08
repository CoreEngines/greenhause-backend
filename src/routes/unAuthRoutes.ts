import { Router } from "express";
import { forgotPassword, resetPassword, signUp, singIn } from "../controllers/authController";
import { validateRequestBody, signUpSchema, email } from "../validators/authValidator";
import passport from "passport";
import { generateAccessToken, generateRefreshToken, Token } from "../utils/jwt";

const unAuthRouter = Router();

unAuthRouter.post("/sign-in", validateRequestBody(email),singIn);
unAuthRouter.post("/sign-up", validateRequestBody(signUpSchema),signUp);
unAuthRouter.post("/forgot-password", validateRequestBody(email),forgotPassword);
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
      const user = req.user as any; // Type assertion
      const token: Token = {
      accessToken: generateAccessToken({ userId: user._id, email: user.email }),
      refreshToken: generateRefreshToken({ userId: user._id, email: user.email }),
      };
      if (req.user) {
        res.cookie("accessToken", token.accessToken, { httpOnly: true, secure: true });
        res.cookie("refreshToken", token.accessToken, { httpOnly: true, secure: true });
        res.redirect("/");
      }
    }
  );

export default unAuthRouter;