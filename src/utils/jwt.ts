import jwt from "jsonwebtoken";
import { Types } from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export type Token = {
    accessToken: string;
    refreshToken: string;
}

export const accessTokenDuration = 7 * 24 * 60 * 60 * 1000;  // 7 days (for testing) modify as wish
export const accessTokenDurationString = "7d"; // 7 days (for testing) modify as wish

export const refreshTokenDuration = 14 * 24 * 60 * 60 * 1000; // 14 days (for testing) modify as wish
export const refreshTokenDurationString = "14d"; // 14 days (for testing) modify as wish

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
        { expiresIn: accessTokenDurationString }
    );
}

export function generateRefreshToken(playload: TokenPayLoad): string {
    return jwt.sign(
        playload, 
        JWT_RT_SECRET, 
        { expiresIn: refreshTokenDurationString }
    );
}