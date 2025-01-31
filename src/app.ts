import express, {Request, Response} from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { error } from "console";
import cors from "cors";
import cookieParser from "cookie-parser";
import { logger } from "./middlewares/logger";
import { errorLogger } from "./middlewares/errorLogger";
import authRouter from "./routes/authRoutes";
import { connectDB } from "./config/dbConnection";

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
app.use("/auth", authRouter);

app.get("/",  (req: Request, res, Response) => {
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