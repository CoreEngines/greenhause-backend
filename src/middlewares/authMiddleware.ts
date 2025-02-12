import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { TokenPayLoad } from "../utils/jwt";
import User from "../models/users";

export function isAuthenticated(req: Request, res: Response, next: NextFunction): void {
    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
        res.status(401).json({ error: "Unauthorized" });
    }

    try {
        const decode = jwt.verify(accessToken, process.env.JWT_AT_SECRET!) as TokenPayLoad;
        if (!decode) {
            res.status(401).json({ error: "Unauthorized" });
        }

        next();
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Unauthorized" });
    }
}

export async function isAdmin(req: Request, res: Response, next: NextFunction) {
    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
        res.status(401).json({ error: "Unauthorized" });
    }

    try {
        const decode = jwt.verify(accessToken, process.env.JWT_AT_SECRET!) as TokenPayLoad;
        console.log(decode);
        if (!decode) {
            res.status(401).json({ error: "Unauthorized" });
        }

        const user = await User.findById(decode.userId);
        if (user && user.isAdmin) {
            next();
            return;
        }

        res.status(401).json({ error: "Unauthorized" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Unauthorized" });
    }
}

export async function isDeleted(req: Request, res: Response, next: NextFunction): Promise<void> {
    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }

    try {
        const decode = jwt.verify(accessToken, process.env.JWT_AT_SECRET!) as TokenPayLoad;
        console.log(decode);
        if (!decode) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const user = await User.findById(decode.userId);
        if (user && user.isDeleted) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        next();
        return;
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Unauthorized" });
    }

}