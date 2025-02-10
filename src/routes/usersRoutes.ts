import { Router } from "express";
import { deleteUser, getAllUsers, getUserById, getUserByToken, requestAccountDeletion, updateUser } from "../controllers/usersController";
import { isAdmin } from "../middlewares/authMiddleware";
import { signUpSchema as body, validateRequestBody } from "../validators/authValidator";

const usersRouter = Router();

usersRouter.get("/all", isAdmin, getAllUsers);
usersRouter.get("/me", getUserByToken);
usersRouter.put("/me/update", validateRequestBody(body), updateUser);
usersRouter.get("/me/request-account-deletion", requestAccountDeletion);
usersRouter.delete("/delete", deleteUser);
usersRouter.get("/:id", getUserById);

export default usersRouter;