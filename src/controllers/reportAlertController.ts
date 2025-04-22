import {Request, Response} from "express";
import Alert from "../models/alerts";
import GreenHouse from "../models/greenHouses";
import {ws} from "../app";
import {validateUser as validateAndGetUser} from "../middlewares/authMiddleware";

export async function reportAlertController(req: Request, res: Response): Promise<void> {
    const user = await validateAndGetUser(req, res);
    if (!user) return;

    try {
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
    const user = await validateAndGetUser(req, res);
    if (!user) return;

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
