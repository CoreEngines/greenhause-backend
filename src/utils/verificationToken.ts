import crypto from "crypto";

export function generateFormattedToken(): string {
    // Generate 8 random bytes (16 hexadecimal characters)
    const randomBytes = crypto.randomBytes(8).toString("hex");

    // Convert to alphanumeric characters (A-Z, a-z, 0-9)
    const alphanumeric = randomBytes.replace(/[^a-zA-Z0-9]/g, '');

    // Take the first 8 characters to ensure the token is 8 characters long
    const token = alphanumeric.slice(0, 8).toUpperCase();

    return token;
}