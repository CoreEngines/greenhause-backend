import jwt from "jsonwebtoken";
import { Types } from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export type Token = {
    accessToken: string;
    refreshToken: string;
}

export type TokenPayLoad = {
    userId: Types.ObjectId;
    email: string;
}

const JWT_AT_SECRET = process.env.JWT_AT_SECRET!;
const JWT_RT_SECRET = process.env.JWT_RT_SECRET!;

export function generateAccessToken(playload: TokenPayLoad) {
    return jwt.sign(
        playload, 
        JWT_AT_SECRET, 
        { expiresIn: "15m" }
    );
}

export function generateRefreshToken(playload: TokenPayLoad): string {
    return jwt.sign(
        playload, 
        JWT_RT_SECRET, 
        { expiresIn: "7d" }
    );
}