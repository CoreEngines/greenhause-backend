import { Request, Response, Router } from "express";
import { forgotPassword, resetPassword, signUp, signIn } from "../controllers/authController";
import { validateRequestBody, signUpSchema, email } from "../validators/authValidator";
import passport from "passport";
import { generateAccessToken, generateRefreshToken, Token } from "../utils/jwt";
import { Types } from "mongoose";

type ProviderUserPayload = {
    _id: Types.ObjectId;
    email: string;
}

const unAuthRouter = Router();

unAuthRouter.post("/sign-in", validateRequestBody(email), signIn);
unAuthRouter.post("/sign-up", validateRequestBody(signUpSchema), signUp);
unAuthRouter.post("/forgot-password", validateRequestBody(email), forgotPassword);
unAuthRouter.post("/reset-password", resetPassword);

unAuthRouter.get(
    "/google", 
    passport.authenticate(
        'google', 
        { scope: ["profile", "email"] },
    ),
);

unAuthRouter.get(
    "/github",
    passport.authenticate(
        'github',
        { scope : ["profile","email"]},
    )
);

unAuthRouter.get(
    "/google/callback",
    passport.authenticate("google", { session: false }), 
    (req: Request, res: Response) => {

        const user = req.user as ProviderUserPayload;

        const token: Token = {
            accessToken: generateAccessToken({ userId: user._id, email: user.email }),
            refreshToken: generateRefreshToken({ userId: user._id, email: user.email }),
        };

        if (req.user) {
            res.cookie(
                "accessToken", 
                token.accessToken,
                { 
                    httpOnly: true, 
                    secure: true,
                    sameSite: 'strict', 
                    maxAge: 15 * 60 * 1000, // 15 minutes
                    expires: new Date(Date.now() + 15 * 60 * 1000)
                }
            );
            res.cookie(
                "refreshToken", 
                token.refreshToken,
                { 
                    httpOnly: true, 
                    secure: true,
                    sameSite: 'strict', 
                    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
                    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                }

            );
            res.redirect("/");
        }
    }
);

unAuthRouter.get(
    "/github/callback",
    passport.authenticate("github", { session:false }),
    (req: Request ,res: Response) => {
        const user = req.user as ProviderUserPayload;

        const token : Token = {
            accessToken : generateAccessToken({ userId:user._id, email:user.email }),
            refreshToken: generateRefreshToken({ userId:user._id,email:user.email }),
        };

        if (req.user){
            res.cookie(
                "accessToken", 
                token.accessToken,
                { 
                    httpOnly: true, 
                    secure: true,
                    sameSite: 'strict', 
                    maxAge: 15 * 60 * 1000, // 15 minutes
                    expires: new Date(Date.now() + 15 * 60 * 1000)
                }
            );
            res.cookie(
                "refreshToken", 
                token.refreshToken,
                { 
                    httpOnly: true, 
                    secure: true,
                    sameSite: 'strict', 
                    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
                    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                }

            );
            res.redirect("/");
        }
    }
)

export default unAuthRouter;