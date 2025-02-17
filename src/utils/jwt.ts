import jwt from "jsonwebtoken";
import { Types } from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export type Token = {
    accessToken: string;
    refreshToken: string;
}

export const accessTokenDuration = 24 * 60 * 60 * 1000; 
export const accessTokenDurationString = "1d"; 

export const refreshTokenDuration = 30 * 24 * 60 * 60 * 1000; 
export const refreshTokenDurationString = "30d"; 

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