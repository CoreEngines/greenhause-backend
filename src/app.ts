import express, { Request, Response } from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { error } from "console";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRouter from "./routes/authRoutes";
import PassportConfig from "./config/passportConfig";
import unAuthRouter from "./routes/unAuthRoutes";
import { logger } from "./middlewares/logger";
import { errorLogger } from "./middlewares/errorLogger";
import { connectDB } from "./config/dbConnection";
import { isAuthenticated, isDeleted } from "./middlewares/authMiddleware";
import { appRateLimiter } from "./middlewares/rateLimiter";
import usersRouter from "./routes/usersRoutes";
import { setupSwagger } from "./config/swagger";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3030;

connectDB();

app.use(express.json());
app.use(logger);
app.use(errorLogger);
app.use(cors({
    credentials: true,
}));
app.use(cookieParser());

try {
    const passportConfig = new PassportConfig();
    app.use(passportConfig.initialize());
} catch (error) {
    console.error("[ERROR]: Failed to set up OAuth strategies:", error);
    throw new Error("Failed to set up OAuth strategies. Check your configuration and environment variables.");
}

setupSwagger(app);

// app.use("/auth", appRateLimiter, unAuthRouter);
// app.use("/auth", appRateLimiter, isAuthenticated, isDeleted, authRouter);
// app.use("/users", appRateLimiter, isAuthenticated, isDeleted, usersRouter); Disabled for testing

app.use("/auth", unAuthRouter);
app.use("/auth", isAuthenticated, isDeleted, authRouter);
app.use("/users", isAuthenticated, isDeleted, usersRouter);

app.get("/",  (req: Request, res: Response) => {
    res.status(200).json({ message: "Hello, World!"});
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

mongoose.connection.on("open", () => {
    console.log("[INFO] Connected to MonogoDB");
});

mongoose.connection.on("error", () => {
    console.log(error);
});

mongoose.connection.on("disconnected", () => {
    console.log("[INFO]: Disconnected to MonogoDB");
});