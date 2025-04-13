import {Request, Response} from "express";
import Alert from "../models/alerts";
import {TokenPayLoad} from "../utils/jwt";
import jwt from "jsonwebtoken";
import User from "../models/users";
import GreenHouse from "../models/greenHouses";

export async function reportAlertController(
    req: Request,
    res: Response
): Promise<void> {
    try {
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

        const {greenHouseId, alertType, title, description} = req.body;
        // Validate input
        if (!greenHouseId || !alertType || !title || !description) {
            res.status(400).json({message: "All fields are required"});
            return;
        }

        const greenHouse = await GreenHouse.findOne({_id: greenHouseId});
        if (!greenHouse) {
            res.status(400).json({error: "Green house doesn't exist"});
            return;
        }

        // Create a new alert
        const newAlert = new Alert({
            greenHouseId,
            alertType,
            title,
            description,
        });

        // Save the alert to the database
        try {
            await newAlert.save();
        } catch (error) {
            console.error("Error saving alert:", error);
            res.status(500).json({message: "Error saving alert"});
            return;
        }

        res.status(201).json({message: "Alert reported successfully", alert: newAlert});
        return;
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Internal server error"});
        return;
    }
}