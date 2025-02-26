import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { comparePassword, hashPassword } from "../utils/hash";
import User from "../models/users";
import Manager from "../models/managers";
import { getEmailTemplate, sendEmail } from "../utils/email";
import { generateFormattedToken } from "../utils/verificationToken";
import VerificationToken from "../models/verificationTokens";
import {
    Token,
    TokenPayLoad,
    generateAccessToken,
    refreshTokenDuration,
    accessTokenDuration,
    generateRefreshToken,
} from "../utils/jwt";

export async function signUp(req: Request, res: Response) {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        res.status(400).json({ error: "Please fill in all fields" });
        return;
    }

    // Check if user already exists
    const user = await User.findOne({ email });
    if (user) {
        res.status(400).json({ error: "User already exists" });
        return;
    }

    // hash password
    const hash = await hashPassword(password);

    // Create new user
    const newUser = new User({
        name,
        email,
        password: hash,
        role: "manager",
    });

    const token: Token = {
        accessToken: generateAccessToken({
            userId: newUser._id,
            email: newUser.email,
        }),
        refreshToken: generateRefreshToken({
            userId: newUser._id,
            email: newUser.email,
        }),
    };

    try {
        const manager = new Manager({
            userId: newUser._id,
        })

        await Promise.all([newUser.save(), manager.save()]);


        res.cookie("accessToken", token.accessToken, {
            httpOnly: true,
            sameSite: "strict",
            maxAge: accessTokenDuration,
            expires: new Date(Date.now() + accessTokenDuration),
        });
        res.cookie("refreshToken", token.refreshToken, {
            httpOnly: true,
            sameSite: "strict",
            maxAge: refreshTokenDuration,
            expires: new Date(Date.now() + refreshTokenDuration),
        });

        res.status(201).json({
            message: "User created successfully",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error creating user" });
    }
}

export async function signIn(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400).json({ error: "Please fill in all fields" });
        return;
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            res.status(400).json({ error: "User doesn't exist" });
            return;
        }
        if (user.isDeleted) {
            res.status(400).json({ error: "Unauthorized" });
            return;
        }
        const match = await comparePassword(password, user.password);
        if (!match) {
            res.status(400).json({ error: "Invalid credentials" });
            return;
        }

        const token: Token = {
            accessToken: generateAccessToken({
                userId: user._id,
                email: user.email,
            }),
            refreshToken: generateRefreshToken({
                userId: user._id,
                email: user.email,
            }),
        };

        res.cookie("accessToken", token.accessToken, {
            httpOnly: true,
            sameSite: "strict",
            maxAge: accessTokenDuration,
            expires: new Date(Date.now() + accessTokenDuration),
        });
        res.cookie("refreshToken", token.refreshToken, {
            httpOnly: true,
            sameSite: "strict",
            maxAge: refreshTokenDuration,
            expires: new Date(Date.now() + refreshTokenDuration),
        });

        // Role-based redirects
        const redirectMap: Record<string, string> = {
            manager: "http://localhost:3000/manager",
            farmer: "http://localhost:3000/farmer",
            technician: "http://localhost:3000/technician",
        };
        
        res.status(200).json({
            message: "User logged in successfully",
            redirectUrl: redirectMap[user.role] || "",
        });
    } catch (error) {
        console.error("Error logging in user:", error);
        res.status(500).json({ error: "Error logging in user" });
    }
}

export function logout(req: Request, res: Response) {
    try {
        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");
        res.status(200).json({ message: "User logged out successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal server error" });
    }
}

export async function sendVerificationEmail(req: Request, res: Response) {
    // get the access token from the cookie
    const accessToken: string = req.cookies.accessToken;
    if (!accessToken) {
        res.status(400).json({ error: "No access token provided" });
    }

    const payload: TokenPayLoad = jwt.verify(
        accessToken,
        process.env.JWT_AT_SECRET!
    ) as TokenPayLoad;
    if (!payload) {
        res.status(400).json({ error: "Invalid access token" });
    }

    const user = await User.findOne({ email: payload.email });
    if (!user) {
        res.status(400).json({ error: "User doesn't exist" });
        return;
    }

    if (user.isDeleted) {
        res.status(400).json({ error: "Unauthorized" });
        return;
    }

    const verificationToken = new VerificationToken({
        token: generateFormattedToken(),
        userId: payload.userId,
        type: "email-verification",
    });

    try {
        await verificationToken.save();
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Error saving verification token" });
    }

    const verificationTokenLink: string = `http://localhost:${process.env.PORT}/auth/verify?token=${verificationToken.token}`;
    const emailBody = getEmailTemplate(
        "verification-email-template",
        verificationTokenLink,
        verificationToken.token
    );
    const subject: string = "Email Verification";

    try {
        await sendEmail(payload.email, subject, emailBody);
        res.status(200).json({ message: "Verification email sent" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Error sending verification email" });
    }
}

export async function verifyEmail(req: Request, res: Response): Promise<void> {
    const verificationToken = req.query.token as string;
    const accessToken = req.cookies.accessToken;

    if (!verificationToken) {
        res.status(400).json({ error: "Token is required" });
        return;
    }

    const payload: TokenPayLoad = jwt.verify(
        accessToken,
        process.env.JWT_AT_SECRET!
    ) as TokenPayLoad;
    if (!payload) {
        res.status(400).json({ error: "Invalid access token" });
    }

    try {
        const token = await VerificationToken.findOne({
            token: verificationToken,
        });
        if (!token) {
            res.status(404).json({ error: "Invalid or expired token" });
            return;
        }

        if (token.type !== "email-verification") {
            res.status(404).json({ error: "Invalid token type" });
            return;
        }

        const user = await User.findOne({ _id: token.userId });
        if (!user) {
            res.status(404).json({
                error: "User associated with this token was not found. It may have been deleted or does not exist.",
            });
            return;
        }

        if (user._id.toString() != payload.userId.toString()) {
            res.status(404).json({ error: "Invalid or expired token" });
            return;
        }

        if (user.isVerified) {
            res.status(400).json({ message: "User already verified" });
            return;
        }

        user.isVerified = true;

        try {
            await user.save();
        } catch (error) {
            console.error("Error saving user:", error);
            res.status(500).json({ error: "Error updating user" });
            return;
        }

        try {
            await VerificationToken.deleteOne({ _id: token._id });
        } catch (error) {
            console.error("Error deleting token:", error);
            res.status(500).json({ error: "Error cleaning up token" });
            return;
        }

        res.status(200).json({ message: "Email verified successfully" });
    } catch (error) {
        console.error("Error verifying email:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

export async function forgotPassword(
    req: Request,
    res: Response
): Promise<void> {
    const { email } = req.body;
    console.log(email);
    if (!email) {
        res.status(400).json({ error: "Email is required" });
        return;
    }

    try {
        const user = await User.findOne({ email: email });
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        if (user.isDeleted) {
            res.status(400).json({ error: "Unauthorized" });
            return;
        }

        const resetPasswordToken = new VerificationToken({
            token: generateFormattedToken(),
            userId: user._id,
            type: "reset-password",
        });

        try {
            await resetPasswordToken.save();
        } catch (error) {
            console.log(error);
            res.status(500).json({
                error: "Error saving reset password token",
            });
            return;
        }

        const resetPasswordLink: string = `http://localhost:${process.env.PORT}/auth/reset-password?token=${resetPasswordToken.token}`;
        const emailBody = getEmailTemplate(
            "forgot-password-template",
            resetPasswordLink,
            resetPasswordToken.token
        );
        const subject: string = "Reset Password";

        try {
            await sendEmail(user.email, subject, emailBody);
            res.status(200).json({ message: "Reset password email sent" });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                error: "Error sending reset password email",
            });
        }
    } catch (error) {
        console.error("Error saving reset password token:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

export async function resetPassword(
    req: Request,
    res: Response
): Promise<void> {
    const resetPasswordToken = req.query.token as string;
    const { password, email } = req.body;

    if (!resetPasswordToken) {
        console.log("token missing");
        res.status(400).json({ error: "Token is required" });
        return;
    }

    if (!password) {
        console.log("[pass] missing");
        res.status(400).json({ error: "Password is required" });
        return;
    }

    if (!email) {
        console.log("email missing");
        res.status(400).json({ error: "Email is required" });
        return;
    }

    try {
        const token = await VerificationToken.findOne({
            token: resetPasswordToken,
        });
        if (!token) {
            console.log("Invalid or expired token");
            res.status(404).json({ error: "Invalid or expired token" });
            return;
        }

        if (token.type.toString() !== "reset-password") {
            console.log("Invalid token type");
            res.status(404).json({ error: "Invalid token type" });
            return;
        }

        const user = await User.findOne({ _id: token.userId });
        if (!user) {
            console.log(
                "User associated with this token was not found. It may have been deleted or does not exist."
            );
            res.status(404).json({
                error: "User associated with this token was not found. It may have been deleted or does not exist.",
            });
            return;
        }

        const emailUser = await User.findOne({ email });
        if (!emailUser) {
            console.log(
                "User associated with this token was not found. It may have been deleted or does not exist.2"
            );
            res.status(404).json({
                error: "User associated with this token was not found. It may have been deleted or does not exist.",
            });
            return;
        }

        if (emailUser._id.toString() != user._id.toString()) {
            res.status(404).json({ error: "token doesnt match email" });
            return;
        }

        const hash = await hashPassword(password);
        user.password = hash;
        try {
            await user.save();
        } catch (error) {
            console.error("Error saving user:", error);
            res.status(500).json({ error: "Error updating user" });
            return;
        }

        try {
            await VerificationToken.deleteOne({ _id: token._id });
        } catch (error) {
            console.error("Error deleting token:", error);
            res.status(500).json({ error: "Error cleaning up token" });
            return;
        }

        const subject: string = "Successful Password Reset";

        try {
            await sendEmail(
                user.email,
                subject,
                getEmailTemplate("successful-password-reset-template")
            );
        } catch (error) {
            console.log(error);
            res.status(500).json({
                error: "Error sending reset password email",
            });
            return;
        }
        res.status(200).json({ message: "Password reset successfully" });
        return;
    } catch (error) {
        console.error("Error resetting password:", error);
        res.status(500).json({ error: "Internal server error" });
        return;
    }
}

export async function checkToken(req: Request, res: Response) {
    const accessToken = req.cookies;
    const { token, tokenType } = req.body;

    if (!accessToken) {
        res.status(400).json({ error: "No access token provided" });
        return;
    }

    if (!token) {
        res.status(400).json({ error: "No token provided" });
        return;
    }

    if (!tokenType) {
        res.status(400).json({ error: "No token type provided" });
        return;
    }

    const foundToken = await VerificationToken.findOne({ token: token });

    if (!foundToken) {
        res.status(400).json({ error: "token provided doesnt exist" });
        return;
    }

    if (foundToken.type.toString() !== tokenType) {
        res.status(400).json({ error: "token type invalid" });
        return;
    }

    res.status(200).json({ token: "valid" });
}
