import { Request, Response, Router } from "express";
import { forgotPassword, resetPassword, signUp, signIn } from "../controllers/authController";
import { validateRequestBody, signUpSchema, email } from "../validators/authValidator";
import passport from "passport";
import { generateAccessToken, generateRefreshToken, Token } from "../utils/jwt";
import { Types } from "mongoose";

type ProviderUserPayload = {
    _id: Types.ObjectId;
    email: string;
};

const unAuthRouter = Router();

/**
 * @swagger
 * /sign-in:
 *   post:
 *     summary: Sign in a user
 *     description: Authenticates a user and returns access and refresh tokens as cookies.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: User signed in successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "User logged in successfully"
 *       400:
 *         description: Invalid email or password
 *       500:
 *         description: Internal server error
 */
unAuthRouter.post("/sign-in", validateRequestBody(email), signIn);

/**
 * @swagger
 * /sign-up:
 *   post:
 *     summary: Sign up a new user
 *     description: Registers a new user and returns access and refresh tokens as cookies.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "User created successfully"
 *       400:
 *         description: User already exists or invalid input
 *       500:
 *         description: Internal server error
 */
unAuthRouter.post("/sign-up", validateRequestBody(signUpSchema), signUp);

/**
 * @swagger
 * /forgot-password:
 *   post:
 *     summary: Request password reset
 *     description: Sends a password reset email to the user's registered email address.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: Password reset email sent successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Reset password email sent"
 *       400:
 *         description: Email is required or user not found
 *       500:
 *         description: Internal server error
 */
unAuthRouter.post("/forgot-password", validateRequestBody(email), forgotPassword);

/**
 * @swagger
 * /reset-password:
 *   post:
 *     summary: Reset user password
 *     description: Resets the user's password using the token sent to their email.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 example: "123456"
 *               password:
 *                 type: string
 *                 example: "newpassword123"
 *     responses:
 *       200:
 *         description: Password reset successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Password reset successfully"
 *       400:
 *         description: Token or password is required
 *       404:
 *         description: Invalid or expired token
 *       500:
 *         description: Internal server error
 */
unAuthRouter.post("/reset-password", resetPassword);

/**
 * @swagger
 * /google:
 *   get:
 *     summary: Authenticate with Google
 *     description: Redirects the user to Google's OAuth2 login page.
 *     responses:
 *       302:
 *         description: Redirect to Google OAuth2 login page
 */
unAuthRouter.get(
    "/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);

/**
 * @swagger
 * /github:
 *   get:
 *     summary: Authenticate with GitHub
 *     description: Redirects the user to GitHub's OAuth2 login page.
 *     responses:
 *       302:
 *         description: Redirect to GitHub OAuth2 login page
 */
unAuthRouter.get(
    "/github",
    passport.authenticate("github", { scope: ["profile", "email"] })
);

/**
 * @swagger
 * /google/callback:
 *   get:
 *     summary: Google OAuth2 callback
 *     description: Handles the callback from Google OAuth2 and sets access and refresh tokens as cookies.
 *     responses:
 *       302:
 *         description: Redirects to the home page after successful authentication
 *       401:
 *         description: Authentication failed
 *       500:
 *         description: Internal server error
 */
unAuthRouter.get(
    "/google/callback",
    passport.authenticate("google", { session: false }),
    (req: Request, res: Response) => {
        const user = req.user as ProviderUserPayload;
        const token: Token = {
            accessToken: generateAccessToken({ userId: user._id, email: user.email }),
            refreshToken: generateRefreshToken({ userId: user._id, email: user.email }),
        };

        res.cookie("accessToken", token.accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 15 * 60 * 1000, // 15 minutes
        });
        res.cookie("refreshToken", token.refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.redirect("/");
    }
);

/**
 * @swagger
 * /github/callback:
 *   get:
 *     summary: GitHub OAuth2 callback
 *     description: Handles the callback from GitHub OAuth2 and sets access and refresh tokens as cookies.
 *     responses:
 *       302:
 *         description: Redirects to the home page after successful authentication
 *       401:
 *         description: Authentication failed
 *       500:
 *         description: Internal server error
 */
unAuthRouter.get(
    "/github/callback",
    passport.authenticate("github", { session: false }),
    (req: Request, res: Response) => {
        const user = req.user as ProviderUserPayload;
        const token: Token = {
            accessToken: generateAccessToken({ userId: user._id, email: user.email }),
            refreshToken: generateRefreshToken({ userId: user._id, email: user.email }),
        };

        res.cookie("accessToken", token.accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 15 * 60 * 1000, // 15 minutes
        });
        res.cookie("refreshToken", token.refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.redirect("/");
    }
);

export default unAuthRouter;