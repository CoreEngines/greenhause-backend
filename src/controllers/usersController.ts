import { Request, Response } from "express";
import User from "../models/users";
import jwt from "jsonwebtoken";
import { TokenPayLoad } from "../utils/jwt";
import { Types } from "mongoose";
import VerificationToken from '../models/verificationTokens';
import { generateFormattedToken } from "../utils/verificationToken";
import { getEmailTemplate, sendEmail } from "../utils/email";

export async function getAllUsers(req: Request, res: Response): Promise<void> {
    try {
        const users = await User.find();
        res.status(200).json(users);
        return;
    } catch (error) {
        console.log(error); 
        res.status(500).json({ error: "Internal Server Error" });
    }
}

export async function getUserById(req: Request, res: Response): Promise<void> {
    try {
        const user = await User.findById(req.params.id);
        res.status(200).json(user);
        return;
    } catch (error) {
        console.log(error); 
        res.status(500).json({ error: "Internal Server Error" });
    }
}

export async function getUserByToken(req: Request, res: Response): Promise<void> {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            res.status(400).json({ error: "No refresh token provided" });
        }

        try {
           const payload = jwt.verify(refreshToken, process.env.JWT_RT_SECRET!) as TokenPayLoad; 
           if (!payload) {
               res.status(400).json({ error: "Invalid refresh token" });
           }

           console.log(payload);
            if (!Types.ObjectId.isValid(payload.userId)) {
                res.status(400).json({ error: "Invalid user id" });
                return;
            }

           try {
                const user = await User.findById(payload.userId); 
                if (!user) {
                    res.status(404).json({ error: "User not found" });
                    return;
                }

                res.status(200).json(user); 
           } catch (error) {
                console.log(error);
                res.status(500).json({ error: "Internal Server Error" });
           }

        } catch (error) {
            console.log(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
}

export async function updateUser(req: Request, res: Response): Promise<void> {
    const {name} = req.body;

    if (!name) {
        res.status(400).json({ error: "Missing fields" });
        return;
    }

    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        res.status(400).json({ error: "No refresh token provided" });
        return;
    }

    try {
        const payload = jwt.verify(refreshToken, process.env.JWT_RT_SECRET!) as TokenPayLoad;
        if (!payload) {
            res.status(400).json({ error: "Invalid refresh token" });
            return;
        }

        if (!Types.ObjectId.isValid(payload.userId)) {
            res.status(400).json({ error: "Invalid user id" });
            return;
        }

        const user = await User.findById(payload.userId);
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }

        if (name) user.name = name;

        await user.save();
        res.status(200).json({ message: "User updated successfully" });

    } catch (error) {
        console.error(error);

        if (error instanceof jwt.JsonWebTokenError) {
            res.status(400).json({ error: "Invalid token" });
        } else if (error instanceof jwt.TokenExpiredError) {
            res.status(400).json({ error: "Token expired" });
        } else {
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
}

export async function deleteUserById(req: Request, res: Response): Promise<void> {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }

        user.deleteOne();
        await user.save();

        res.status(200).json(user);
        return;
    } catch (error) {
        console.log(error); 
        res.status(500).json({ error: "Internal Server Error" });
    }
}

export async function requestAccountDeletion(req: Request, res: Response): Promise<void> {
    const accessToken = req.cookies.accessToken;
    if (!accessToken) {
        res.status(400).json({ error: "No refresh token provided" });
        return;
    }

    try {
        const payload = jwt.verify(accessToken, process.env.JWT_AT_SECRET!) as TokenPayLoad;
        if (!payload) {
            res.status(400).json({ error: "Invalid refresh token" });
            return;
        }

        if (!Types.ObjectId.isValid(payload.userId)) {
            res.status(400).json({ error: "Invalid user id" });
            return;
        }

        const user = await User.findById(payload.userId);
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }

        const deleteToken = new VerificationToken({
            token: generateFormattedToken(),
            userId: user._id,
        });

        try {
            await deleteToken.save();
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: "Error saving reset password token" });
            return;
        }

        const deleteAccountLink: string = `http://localhost:${process.env.PORT}/users/delete?token=${deleteToken.token}`;
        const emailBody = getEmailTemplate(deleteAccountLink, deleteToken.token, "delete-account-template");
        const subject: string = "Request Account Deletion";

        try {
            await sendEmail(user.email, subject, emailBody);
            res.status(200).json({ message: "Account deletion email sent successfully" });
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: "Error sending reset password email" });
        }
        
    } catch (error) {
        console.error(error);

        if (error instanceof jwt.JsonWebTokenError) {
            res.status(400).json({ error: "Invalid token" });
        } else if (error instanceof jwt.TokenExpiredError) {
            res.status(400).json({ error: "Token expired" });
        } else {
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
}

export async function deleteUser(req: Request, res: Response): Promise<void> {
    const deletionToken = req.query.token as string;

    if (!deletionToken) {
        res.status(400).json({ error: "No token provided" });
        return;
    }

    try {
        const token = await VerificationToken.findOne({ token: deletionToken });
        if (!token) {
            res.status(404).json({ error: "Invalid or expired token" });
            return;
        }

        const user = await User.findOne({ _id: token.userId });
        if (!user) {
            res.status(404).json({
                error: "User associated with this token was not found. It may have been deleted or does not exist.",
            });
            return;
        }

        user.deletedAt = new Date(Date.now());

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

        res.status(200).json({ message: "Account deleted successfully" });
    } catch (error) {
        console.log(error);
        console.error("Error deleting the account:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}