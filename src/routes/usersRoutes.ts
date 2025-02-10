import { Router } from "express";
import { deleteUser, getAllUsers, getUserById, getUserByToken, requestAccountDeletion, updateUser } from "../controllers/usersController";
import { isAdmin } from "../middlewares/authMiddleware";
import { signUpSchema as body, validateRequestBody } from "../validators/authValidator";

const usersRouter = Router();

/**
 * @swagger
 * /users/all:
 *   get:
 *     summary: Get all users (Admin only)
 *     description: Retrieves a list of all users. Requires admin privileges.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized (admin access required)
 *       500:
 *         description: Internal server error
 */
usersRouter.get("/all", isAdmin, getAllUsers);

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get current user details
 *     description: Retrieves the details of the currently authenticated user using the refresh token.
 *     responses:
 *       200:
 *         description: User details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: No refresh token provided or invalid token
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
usersRouter.get("/me", getUserByToken);

/**
 * @swagger
 * /users/me/update:
 *   put:
 *     summary: Update current user details
 *     description: Updates the details of the currently authenticated user.
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
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "User updated successfully"
 *       400:
 *         description: Missing fields or invalid token
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
usersRouter.put("/me/update", validateRequestBody(body), updateUser);

/**
 * @swagger
 * /users/me/request-account-deletion:
 *   get:
 *     summary: Request account deletion
 *     description: Sends an account deletion confirmation email to the user.
 *     responses:
 *       200:
 *         description: Account deletion email sent successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Account deletion email sent successfully"
 *       400:
 *         description: No refresh token provided or invalid token
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
usersRouter.get("/me/request-account-deletion", requestAccountDeletion);

/**
 * @swagger
 * /users/delete:
 *   delete:
 *     summary: Delete user account
 *     description: Deletes the user account using the token sent to their email.
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: The deletion token sent to the user's email.
 *     responses:
 *       200:
 *         description: Account deleted successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Account deleted successfully"
 *       400:
 *         description: No token provided or invalid token
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
usersRouter.delete("/delete", deleteUser);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user by ID
 *     description: Retrieves the details of a user by their ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to retrieve.
 *     responses:
 *       200:
 *         description: User details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid user ID
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
usersRouter.get("/:id", getUserById);

export default usersRouter;