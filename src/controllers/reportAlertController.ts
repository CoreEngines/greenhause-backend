import {Request, Response} from "express";
import Alert from "../models/alerts";
import {TokenPayLoad} from "../utils/jwt";
import jwt from "jsonwebtoken";
import User from "../models/users";
import GreenHouse from "../models/greenHouses";
import {ws} from "../app";

export async function reportAlertController(req: Request, res: Response): Promise<void> {
    try {
        const accessToken = req.cookies.accessToken;
        if (!accessToken) {
            res.status(400).json({error: "No access token provided"});
            return;
        }

        const payload: TokenPayLoad = jwt.verify(accessToken, process.env.JWT_AT_SECRET!) as TokenPayLoad;
        if (!payload) {
            res.status(400).json({error: "Invalid access token"});
            return;
        }

        const user = await User.findOne({email: payload.email});
        if (!user) {
            res.status(400).json({error: "User doesn't exist"});
            return;
        }

        const {greenHouseId, alertType, title, description} = req.body;
        if (!greenHouseId || !alertType || !title || !description) {
            res.status(400).json({message: "All fields are required"});
            return;
        }

        const greenHouse = await GreenHouse.findOne({_id: greenHouseId});
        if (!greenHouse) {
            res.status(400).json({error: "Green house doesn't exist"});
            return;
        }

        const newAlert = new Alert({
            greenHouseId,
            alertType,
            title,
            status: "pending",
            description,
        });

        await newAlert.save();

        // Emit alert to connected users of the same greenhouse
        ws.to(greenHouseId).emit("new-alert", {
            alert: {
                greenHouseId,
                alertType,
                title,
                description,
                status: "pending",
                createdAt: new Date().toISOString(),
            },
        });

        res.status(201).json({message: "Alert reported successfully", alert: newAlert});
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Internal server error"});
    }
}

export async function getAllAlerts(req: Request, res: Response): Promise<void> {
    const accessToken = req.cookies.accessToken;
    if (!accessToken) {
        res.status(400).json({error: "No access token provided"});
        return;
    }
    const payload: TokenPayLoad = jwt.verify(
        accessToken,
        process.env.JWT_AT_SECRET!
    ) as TokenPayLoad;
    if (!payload) {
        res.status(400).json({error: "Invalid access token"});
        return;
    }

    const user = await User.findOne({email: payload.email});
    if (!user) {
        res.status(400).json({error: "User doesn't exist"});
        return;
    }

    const {greenHouseId} = req.body;
    if (!greenHouseId) {
        res.status(400).json({message: "Green house ID is required"});
        return;
    }

    const greenHouse = await GreenHouse.findOne({_id: greenHouseId});
    if (!greenHouse) {
        res.status(400).json({error: "Green house doesn't exist"});
        return;
    }

    const alerts = await Alert.find({greenHouseId});
    if (!alerts) {
        res.status(400).json({error: "No alerts found"});
        return;
    }

    res.status(200).json({alerts});
    return;
}
