import { Request, Response } from 'express';
import { hashPassword } from '../utils/hash';
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
            }
        );
        res.cookie("refreshToken", token.refreshToken,
            { 
                httpOnly: true,
                sameSite: 'strict', 
                maxAge: 7 * 24 * 60 * 60 * 1000,  // 7 days
            }
        );

        res.status(201).json({
            message: "User created successfully",
        });
    } catch (error) {
        res.status(500).json({ error: "Error creating user" });
    }
}