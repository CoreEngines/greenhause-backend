import { Request, Response, NextFunction } from "express";
import jwt, { JsonWebTokenError } from "jsonwebtoken";
import { accessTokenDuration, generateAccessToken, TokenPayLoad } from "../utils/jwt";
import User from "../models/users";

export async function isAuthenticated(req: Request, res: Response, next: NextFunction): Promise<void> {
    const accessToken = req.cookies.accessToken;
    const refreshToken = req.cookies.refreshToken;

    try {
        jwt.verify(accessToken, process.env.JWT_AT_SECRET!);
        next(); 
        return;
    } catch (error) {
        if (error instanceof JsonWebTokenError) {
            try {
                const payload = jwt.verify(refreshToken, process.env.JWT_RT_SECRET!) as TokenPayLoad;
                
                const user = await User.findOne({ email: payload.email });
                if (!user) {
                    res.status(400).json({ error: "User doesn't exist" });
                    return;
                }

                if (user.isDeleted) {
                    res.status(400).json({ error: "Unauthorized - user deleted" });
                    return;
                }

                const newAccessToken = generateAccessToken({ userId: payload.userId, email: payload.email });
                console.log('New Access Token:', newAccessToken);

                res.cookie("accessToken", newAccessToken, {
                    httpOnly: true,
                    sameSite: 'strict',
                    maxAge: accessTokenDuration,
                    expires: new Date(Date.now() + accessTokenDuration),
                });

                req.cookies.accessToken = newAccessToken;
                req.cookies.refreshToken = refreshToken;

                next();
                return;
            } catch (refreshError) {
                if (refreshError instanceof JsonWebTokenError) {
                    res.redirect("http://localhost:3000/sign-in");
                    return;
                }
            }
        }
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