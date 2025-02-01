import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { TokenPayLoad } from "../utils/jwt";

export function isAuthenticated(req: Request, res: Response, next: NextFunction): any {
    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    try {
        const decode = jwt.verify(accessToken, process.env.JWT_AT_SECRET!) as TokenPayLoad;
        if (!decode) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        next();
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Unauthorized" });
    }
}