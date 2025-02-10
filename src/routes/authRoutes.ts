import { Router } from "express";
import {
  logout,
  refresh,
  sendVerificationEmail,
  verifyEmail,
} from "../controllers/authController";

const authRouter = Router();

/**
 * @swagger
 * /auth/logout:
 *   get:
 *     summary: Log out the user
 *     description: Clears the access and refresh tokens from cookies, logging the user out.
 *     responses:
 *       200:
 *         description: User logged out successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "User logged out successfully"
 *       500:
 *         description: Internal server error
 */
authRouter.get("/logout", logout);

/**
 * @swagger
 * /auth/refresh:
 *   get:
 *     summary: Refresh access token
 *     description: Generates a new access token using the refresh token stored in cookies.
 *     responses:
 *       200:
 *         description: Access token refreshed successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Access token refreshed"
 *       400:
 *         description: No refresh token provided
 *       500:
 *         description: Internal server error
 */
authRouter.get("/refresh", refresh);

/**
 * @swagger
 * /auth/request-email-verification:
 *   get:
 *     summary: Request email verification
 *     description: Sends a verification email to the user's registered email address.
 *     responses:
 *       200:
 *         description: Verification email sent successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Verification email sent"
 *       400:
 *         description: No access token provided or invalid access token
 *       500:
 *         description: Internal server error
 */
authRouter.get("/request-email-verification", sendVerificationEmail);

/**
 * @swagger
 * /auth/verify:
 *   get:
 *     summary: Verify email address
 *     description: Verifies the user's email address using the token sent to their email.
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: The verification token sent to the user's email.
 *     responses:
 *       200:
 *         description: Email verified successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Email verified successfully"
 *       400:
 *         description: Token is required or user already verified
 *       404:
 *         description: Invalid or expired token, or user not found
 *       500:
 *         description: Internal server error
 */
authRouter.get("/verify", verifyEmail);

export default authRouter;