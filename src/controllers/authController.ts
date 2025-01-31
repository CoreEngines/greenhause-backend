import { Request, Response } from 'express';
import { comparePassword, hashPassword } from '../utils/hash';
import User from '../models/users';
import { Token, generateAccessToken, generateRefreshToken } from '../utils/jwt';

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

export async function logIn(req: Request, res: Response): Promise<any> {
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