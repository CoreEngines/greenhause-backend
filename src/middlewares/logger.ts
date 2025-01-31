import { format } from "date-fns";
import { v4 as uuidv4 } from "uuid";
import { promises as fs } from "fs";
import path from "path";
import { Request, Response, NextFunction } from "express";

const LOGS_DIR = path.resolve(__dirname, "../logs");

export async function logEvents(message: string, logFileName: string): Promise<void> {
    try {
        const timestamp = format(new Date(), "yyyy-MM-dd HH:mm:ss");
        const logEntry = `${timestamp}\t${uuidv4()}\t${message}\n`;
        const logFilePath = path.join(LOGS_DIR, logFileName);

        // Ensure logs directory exists
        await fs.mkdir(LOGS_DIR, { recursive: true });

        // Append log entry to the log file
        await fs.appendFile(logFilePath, logEntry);
    } catch (error) {
        console.error("Error writing to log file:", error);
    }
}

export function logger(req: Request, res: Response, next: NextFunction): void {
    res.on("finish", () => {
        const logMessage = `${req.method}\t${req.originalUrl}\t${res.statusCode}\t${req.headers.origin || "unknown"}\t${req.ip}\t${req.headers["user-agent"] || "unknown"}`;

        logEvents(logMessage, "reqLog.log").catch((err) => console.error("Logging error:", err));

        console.log(`[${req.method}] ${req.originalUrl} - ${res.statusCode}`);
    });
    next();
}