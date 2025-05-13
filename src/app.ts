import express, {Request, Response} from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import {error} from "console";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRouter from "./routes/authRoutes";
import PassportConfig from "./config/passportConfig";
import unAuthRouter from "./routes/unAuthRoutes";
import {logger} from "./middlewares/logger";
import {errorLogger} from "./middlewares/errorLogger";
import {connectDB} from "./config/dbConnection";
import {isAuthenticated, isDeleted} from "./middlewares/authMiddleware";
import usersRouter from "./routes/usersRoutes";
import {setupSwagger} from "./config/swagger";
import ghRouter from "./routes/greenhouseRoutes";
import managerRoutes from "./routes/managerRoutes";
import * as http from "node:http";
import {Server} from "socket.io";
import reportsAlertsRouter from "./routes/reportsAlertsRoutes";
import reportsRouter from "./routes/reportRoutes";

dotenv.config();

const app = express();
const wss = http.createServer(app);
const PORT = process.env.PORT || 3030;

export const ws = new Server(wss, {
    cors: {
        origin: "http://localhost:3000",
    }
})

connectDB();

app.use(express.json());
app.use(logger);
app.use(errorLogger);
app.use(
    cors({
        origin: "http://localhost:3000",
        credentials: true,
    })
);
app.use(cookieParser());

try {
    const passportConfig = new PassportConfig();
    app.use(passportConfig.initialize());
} catch (error) {
    console.error("[ERROR]: Failed to set up OAuth strategies:", error);
    throw new Error(
        "Failed to set up OAuth strategies. Check your configuration and environment variables."
    );
}

setupSwagger(app);

app.use("/auth", unAuthRouter);
app.use("/auth", isAuthenticated, isDeleted, authRouter);
app.use("/users", isAuthenticated, isDeleted, usersRouter);
app.use("/green-houses", isAuthenticated, isDeleted, ghRouter);
app.use("/manager", isAuthenticated, isDeleted, managerRoutes);
app.use("/reports-alerts", isAuthenticated, isDeleted, reportsAlertsRouter);
app.use("/reports", isAuthenticated, isDeleted, reportsRouter);

app.get("/", (req: Request, res: Response) => {
    res.status(200).json({message: "Hello, World!"});
});

app.listen(PORT, () => {
    console.log(`[APP] Server is running on http://localhost:${PORT}`);
});

wss.listen(3031, () => {
    console.log("[WSS] Server is running on port 3031");
});

export const actuatorStates: { [greenhouseId: string]: boolean } = {};

ws.on("connection", (socket) => {
    console.log("[WSS] New client connected:", socket.id);

    socket.on("disconnect", () => {
        console.log("[WSS] Client disconnected:", socket.id);
    });

    socket.on("join-greenhouse", (greenHouseId) => {
        socket.join(greenHouseId);
        console.log(`User ${socket.id} joined greenhouse ${greenHouseId}`);
    });

    socket.on("actuatorControl", (data: { greenhouseId: string; isEnabled: boolean }) => {
        const {greenhouseId, isEnabled} = data;

        actuatorStates[greenhouseId] = isEnabled;
        console.log(`[WS] Actuator state received: Greenhouse ID = ${greenhouseId}, Enabled = ${isEnabled}`);
    });

});

mongoose.connection.on("open", () => {
    console.log("[DB] Connected to MonogoDB");
});

mongoose.connection.on("error", () => {
    console.log(error);
});

mongoose.connection.on("disconnected", () => {
    console.log("[DB]: Disconnected to MonogoDB");
});
