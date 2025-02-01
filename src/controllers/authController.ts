import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { comparePassword, hashPassword } from '../utils/hash';
import User from '../models/users';
import { getEmailTemplate, sendEmail } from '../utils/email';
import { generateFormattedToken } from '../utils/verificationToken';
import VerificationToken from '../models/verificationTokens';
import { Token, TokenPayLoad, generateAccessToken, generateRefreshToken } from '../utils/jwt';

export async function signUp(req: Request, res: Response) {
    const { name , email, password} =  req.body;
    
    if (!name || !email || !password) {
        res.status(400).json({ error: "Please fill in all fields" });
    }

    // Check if user already exists
    const user = await User.findOne({ email });
    if (user) {
        res.status(400).json({ error: "User already exists" });
    }

    // hash password
    const hash = await hashPassword(password); 

    // Create new user        
    const newUser = new User({
        name,
        email, 
        password: hash 
    });

    const token: Token = {
        accessToken: generateAccessToken({ userId: newUser._id, email: newUser.email }),
        refreshToken: generateRefreshToken({ userId: newUser._id, email: newUser.email }),
    };

    try {
        await newUser.save();
        
        res.cookie("accessToken", token.accessToken,
            { 
                httpOnly: true,
                sameSite: 'strict', 
                maxAge: 15 * 60 * 1000, // 15 minutes   
                expires: new Date(Date.now() + 15 * 60 * 1000)
            }
        );
        res.cookie("refreshToken", token.refreshToken,
            { 
                httpOnly: true,
                sameSite: 'strict', 
                maxAge: 7 * 24 * 60 * 60 * 1000,  // 7 days
                expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            }
        );

        res.status(201).json({
            message: "User created successfully",
        });
    } catch (error) {
        res.status(500).json({ error: "Error creating user" });
    }
}

export async function singIn(req: Request, res: Response): Promise<any> {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Please fill in all fields" });
    }

    const user = await User.findOne({ email });
    if (!user) {
        return res.status(400).json({ error: "user doesnt exisit" });
    }

    try {
        const match = await comparePassword(password, user.password);
        if (!match) {
            return res.status(400).json({ error: "Invalid credentials" });
        } else {
            const token: Token = {
                accessToken: generateAccessToken({ userId: user._id, email: user.email }),
                refreshToken: generateRefreshToken({ userId: user._id, email: user.email }),
            };

            res.cookie("accessToken", token.accessToken, {
                httpOnly: true,
                sameSite: 'strict',
                maxAge: 15 * 60 * 1000, // 15 minutes
                expires: new Date(Date.now() + 15 * 60 * 1000)
            });
            res.cookie("refreshToken", token.refreshToken, {
                httpOnly: true,
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
                expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            });

            return res.status(200).json({
                message: "User logged in successfully",
            });
        }
    } catch (error) {
        return res.status(500).json({ error: "Error logging in user" });
    }
}

export function logout(req: Request, res: Response) {
    try {
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        res.status(200).json({ message: "User logged out successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal server error" });
    }
}

export function refresh(req: Request, res: Response) {
    // Get refresh token from cookie    
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        res.status(400).json({ error: "No refresh token provided" });
    }

    try {
    // Check if refresh token exists and decode the token payload
    const payload: TokenPayLoad = jwt.verify(refreshToken, process.env.JWT_RT_SECRET!) as TokenPayLoad;

    // Generate new access token
    const newAccessToken = generateAccessToken({ userId: payload.userId, email: payload.email });

    // Replace access token in cookie
    res.cookie(
        "accessToken",
        newAccessToken,
        {
            httpOnly: true,
            sameSite: 'strict', 
            maxAge: 15 * 60 * 1000, // 15 minutes
            expires: new Date(Date.now() + 15 * 60 * 1000)
        }
    );

    res.status(200).json({ message: "Access token refreshed" });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export async function sendVerificationEmail(req: Request, res: Response) {
    // get the access token from the cookie
    const accessToken: string = req.cookies.accessToken;
    if (!accessToken) {
        res.status(400).json({ error: "No access token provided" });
    }

    const payload: TokenPayLoad = jwt.verify(accessToken, process.env.JWT_AT_SECRET!) as TokenPayLoad;
    if (!payload) {
        res.status(400).json({ error: "Invalid access token" });
    }   

    const verificationToken =  new VerificationToken({
        token: generateFormattedToken(),
        userId: payload.userId,
    });

    try {
        await verificationToken.save();
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Error saving verification token" });
    }

    const verificationTokenLink: string = `http://localhost:${process.env.PORT}/auth/verify?token=${verificationToken.token}`;
    const emailBody = getEmailTemplate(verificationTokenLink, verificationToken.token, "verification-email-template");
    const subject: string = "Email Verification";

    try {
        await sendEmail(payload.email, subject, emailBody);
        res.status(200).json({ message: "Verification email sent" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Error sending verification email" });
    }
};

export async function verifyEmail(req: Request, res: Response): Promise<any> {
    const verificationToken = req.query.token as string;
    console.log(verificationToken);

    if (!verificationToken) {
        return res.status(400).json({ error: "Token is required"});
    }

    try {
        const token = await VerificationToken.findOne({ token: verificationToken });
        if (!token) {
            return res.status(404).json({ error: "Invalid or expired token" });
        }

        const user = await User.findOne({ _id: token.userId });
        if (!user) {
            return res.status(404).json({
                error: "User associated with this token was not found. It may have been deleted or does not exist.",
            });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: "User already verified" });
        }

        user.isVerified = true;
        try {
            await user.save();
        } catch (error) {
            console.error("Error saving user:", error);
            return res.status(500).json({ error: "Error updating user" });
        }

        try {
            await VerificationToken.deleteOne({ _id: token._id });
        } catch (error) {
            console.error("Error deleting token:", error);
            return res.status(500).json({ error: "Error cleaning up token" });
        }

        return res.status(200).json({ message: "Email verified successfully" });
    } catch (error) {
        console.error("Error verifying email:", error);
        return res.status(500).json({ error: "Internal server error" });
    };
};

export async function forgotPassword(req: Request, res: Response): Promise<any> { 
    const { email } = req.body;
    console.log(email);
    if (!email) {
        return res.status(400).json({ error: "Email is required" });
    }

    try {
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const resetPasswordToken = new VerificationToken({
            token: generateFormattedToken(),
            userId: user._id,
        });

        try {
            await resetPasswordToken.save();
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: "Error saving reset password token" });
        }

        const resetPasswordLink: string = `http://localhost:${process.env.PORT}/auth/reset-password?token=${resetPasswordToken.token}`;
        const emailBody = getEmailTemplate(resetPasswordLink, resetPasswordToken.token, "forgot-password-template");
        const subject: string = "Reset Password";

        try {
            await sendEmail(user.email, subject, emailBody);
            res.status(200).json({ message: "Reset password email sent" });
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: "Error sending reset password email" });
        };

    } catch (error) {
        console.error("Error saving reset password token:", error);
        return res.status(500).json({ error: "User not found" });
    };
};