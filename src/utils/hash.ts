import bcrypt from 'bcrypt';
import crypto from "crypto";

export async function hashPassword(password: string): Promise<string>  {
    try {
        const hash = await bcrypt.hash(password, 10);
        return hash;
    } catch (error) {
        console.log(error);
        throw new Error('Error hashing password'); 
    }
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
    try {
        const match = await bcrypt.compare(password, hash);
        return match;
    } catch (error) {
        console.log(error);
        throw new Error('Error comparing password'); 
    }
}


export function generateRamdomPassword(length: number = 15): string {
    return crypto.randomBytes(length)
    .toString("base64") // Convert to base64 to get letters & numbers
    .replace(/[^a-zA-Z0-9]/g, "") // Remove special characters
    .slice(0, length); // Trim to desired length
}