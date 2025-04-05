import jwt from "jsonwebtoken";
import {Request, Response} from "express";
import {TokenPayLoad} from "../utils/jwt";
import User from "../models/users";
import GreenHouse from "../models/greenHouses";
import Manager from "../models/managers";
import Farmer from "../models/farmers";
import Technician from "../models/technicians";
import {ConnectToDevice, disconnectFromDevice} from "../services/mqtt";
import mongoose from "mongoose";

// create a green house
export async function createGreenHouse(
    req: Request,
    res: Response
): Promise<void> {
    const accessToken = req.cookies.accessToken;
    if (!accessToken) {
        res.status(400).json({error: "No access token provided"});
        return;
    }

    const {plantType, name, location} = req.body;
    if (!plantType || !name || !location) {
        res.status(400).json({error: "Missing fields"});
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

    if (user.isDeleted) {
        res.status(400).json({error: "Unauthorized"});
        return;
    }

    if (user.role !== "manager") {
        res.status(400).json({error: "Unauthorized"});
        return;
    }

    const manager = await Manager.findOne({userId: user._id});
    if (!manager) {
        res.status(400).json({error: "Manager doesn't exist"});
        return;
    }

    const greenHouse = new GreenHouse({
        location: location,
        name: name,
        plantType: plantType,
        managerId: manager._id,
        status: "active",
        farmers: [],
        technicians: [],
        thresholds: {
            temperature: {
                min: 0,
                max: 0,
            },
            humidity: {
                min: 0,
                max: 0,
            },
            soilMoisture: {
                min: 0,
                max: 0,
            },
            ph: {
                min: 0,
                max: 0,
            },
        },
        staffCount: 0,
        isDeleted: false,
        deletedAt: null,
    });

    await greenHouse.save();

    manager.greenHouseIds.push(greenHouse._id);
    await manager.save();

    res.status(200).json(greenHouse);
    return;
}

export async function updateThresholds(req: Request, res: Response) {
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

    const {
        greenHouseId,
        temperature_min,
        temperature_max,
        humidity_min,
        humidity_max,
        soilMoisture_min,
        soilMoisture_max,
        ph_min,
        ph_max
    } = req.body;
    if (!greenHouseId || !temperature_min || !temperature_max || !humidity_min || !humidity_max || !soilMoisture_min || !soilMoisture_max || !ph_min || !ph_max) {
        res.status(400).json({error: "Missing fields"});
        return;
    }


    const user = await User.findOne({email: payload.email});
    if (!user) {
        res.status(400).json({error: "User doesn't exist"});
        return;
    }

    if (user.role !== "manager") {
        res.status(400).json({error: "Unauthorized"});
        return;
    }

    const manager = await Manager.findOne({userId: user._id});
    if (!manager) {
        res.status(400).json({error: "Manager doesn't exist"});
        return;
    }

    const greenHouse = await GreenHouse.findOne({_id: greenHouseId});
    if (!greenHouse) {
        res.status(400).json({error: "Green house doesn't exist"});
        return;
    }

    if (greenHouse.managerId.toString() !== manager._id.toString()) {
        res.status(400).json({error: "Unauthorized"});
        return;
    }

    if (!greenHouse.thresholds) {
        res.status(400).json({error: "Thresholds are not defined for this greenhouse"});
        return;
    }

    if (!greenHouse.thresholds.temperature || !greenHouse.thresholds.humidity || !greenHouse.thresholds.soilMoisture || !greenHouse.thresholds.ph) {
        res.status(400).json({error: "Thresholds are not defined for this greenhouse"});
        return;
    }

    greenHouse.thresholds.temperature.min = temperature_min;
    greenHouse.thresholds.temperature.max = temperature_max;
    greenHouse.thresholds.humidity.min = humidity_min;
    greenHouse.thresholds.humidity.max = humidity_max;
    greenHouse.thresholds.soilMoisture.min = soilMoisture_min;
    greenHouse.thresholds.soilMoisture.max = soilMoisture_max;
    greenHouse.thresholds.ph.min = ph_min;
    greenHouse.thresholds.ph.max = ph_max;

    await greenHouse.save();

    res.status(200).json(greenHouse);
}

export async function deleteGreenHouse(req: Request, res: Response) {
    const accessToken = req.cookies.accessToken;
    if (!accessToken) {
        res.status(400).json({error: "No access token provided"});
        return;
    }

    const {id} = req.body;
    if (!id) {
        res.status(400).json({error: "Missing id"});
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

    if (user.role !== "manager") {
        res.status(400).json({error: "Unauthorized"});
        return;
    }

    const manager = await Manager.findOne({userId: user._id});
    if (!manager) {
        res.status(400).json({error: "Manager doesn't exist"});
        return;
    }

    const greenHouse = await GreenHouse.findOne({_id: id});
    if (!greenHouse) {
        res.status(400).json({error: "Green house doesn't exist"});
        return;
    }

    if (greenHouse.managerId.toString() !== manager._id.toString()) {
        res.status(400).json({error: "Unauthorized"});
        return;
    }

    greenHouse.deletedAt = new Date(Date.now());
    greenHouse.isDeleted = true;
    await greenHouse.save();

    res.status(200).json(greenHouse);
    return;

}

export async function updateGreenHouse(req: Request, res: Response) {
    const accessToken = req.cookies.accessToken;
    if (!accessToken) {
        res.status(400).json({error: "No access token provided"});
        return;
    }

    const {plantType, name, location, id} = req.body;
    if (!plantType || !name || !location || !id) {
        res.status(400).json({error: "Missing fields"});
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

    if (user.role !== "manager") {
        res.status(400).json({error: "Unauthorized"});
        return;
    }

    const manager = await Manager.findOne({userId: user._id});
    if (!manager) {
        res.status(400).json({error: "Manager doesn't exist"});
        return;
    }

    const greenHouse = await GreenHouse.findOne({_id: id});
    if (!greenHouse) {
        res.status(400).json({error: "Green house doesn't exist"});
        return;
    }

    if (greenHouse.managerId.toString() !== manager._id.toString()) {
        res.status(400).json({error: "Unauthorized"});
        return;
    }

    greenHouse.name = name;
    greenHouse.location = location;
    greenHouse.plantType = plantType;

    await greenHouse.save();

    res.status(200).json(greenHouse);
    return;
}

export async function getGreenHouses(req: Request, res: Response) {
    try {
        const accessToken = req.cookies.accessToken;
        if (!accessToken) {
            res.status(400).json({error: "No access token provided"});
            return;
        }

        const payload = jwt.verify(accessToken, process.env.JWT_AT_SECRET!) as TokenPayLoad;
        if (!payload) {
            res.status(400).json({error: "Invalid access token"});
            return;
        }

        const user = await User.findOne({email: payload.email});
        if (!user || user.isDeleted) {
            res.status(400).json({error: "Unauthorized"});
            return;
        }

        let greenhouses: never[] = [];

        if (user.role === "manager") {
            const manager = await Manager.findOne({userId: user._id});
            if (!manager) {
                res.status(400).json({error: "Manager doesn't exist"});
                return;
            }
            greenhouses = await GreenHouse.find({managerId: manager._id});
        }

        if (user.role === "farmer") {
            const farmer = await Farmer.findOne({userId: user._id});
            if (!farmer) {
                res.status(400).json({error: "Farmer doesn't exist"});
                return;
            }
            greenhouses = await GreenHouse.find({_id: {$in: farmer.greenHouseIds}});
        }

        if (user.role === "technician") {
            const technician = await Technician.findOne({userId: user._id});
            if (!technician) {
                res.status(400).json({error: "Technician doesn't exist"});
                return;
            }
            greenhouses = await GreenHouse.find({_id: {$in: technician.greenHouseIds}});
        }

        res.status(200).json({greenhouses});
    } catch (error) {
        console.error(error);
        res.status(500).json({error: "Internal server error"});
    }
}

export async function getGreenHouseWorkers(req: Request, res: Response): Promise<void> {
    try {
        const accessToken = req.cookies.accessToken;
        if (!accessToken) {
            res.status(400).json({error: "No access token provided"});
            return;
        }

        const payload = jwt.verify(accessToken, process.env.JWT_AT_SECRET!) as TokenPayLoad;
        if (!payload) {
            res.status(400).json({error: "Invalid access token"});
            return;
        }

        const user = await User.findOne({email: payload.email});
        if (!user || user.isDeleted) {
            res.status(400).json({error: "Unauthorized"});
            return;
        }
        const {greenHouseId} = req.body;
        if (!greenHouseId) {
            res.status(400).json({error: "greenhouseId is required"});
            return;
        }

        if (!mongoose.Types.ObjectId.isValid(greenHouseId)) {
            res.status(400).json({error: "Invalid greenhouse ID"});
            return;
        }

        const greenhouse = await GreenHouse.findById(greenHouseId)
            .populate({
                path: "farmers",
                select: "-greenHouseIds",
                populate: {
                    path: "userId",
                    select: "name email role"
                }
            })
            .populate({
                path: "technicians",
                select: "-greenHouseIds",
                populate: {
                    path: "userId",
                    select: "name email role"
                }
            });
        if (!greenhouse) {
            res.status(404).json({error: "Greenhouse not found"});
            return;
        }

        const farmers = greenhouse.farmers;
        const technicians = greenhouse.technicians;

        res.status(200).json({farmers, technicians});
    } catch (error) {
        console.error(error);
        res.status(500).json({error: "Internal server error"});
    }
}

export async function connectToGreenHouse(req: Request, res: Response): Promise<void> {
    const accessToken = req.cookies.accessToken;
    if (!accessToken) {
        res.status(400).json({error: "No access token provided"});
        return;
    }

    const payload = jwt.verify(accessToken, process.env.JWT_AT_SECRET!) as TokenPayLoad;
    if (!payload) {
        res.status(400).json({error: "Invalid access token"});
        return;
    }

    const user = await User.findOne({email: payload.email});
    if (!user || user.isDeleted) {
        res.status(400).json({error: "Unauthorized"});
        return;
    }

    const {greenHouseId} = req.body;
    if (!greenHouseId) {
        res.status(400).json({error: "Missing fields"});
        return;
    }

    // mqtt connection
    try {
        await ConnectToDevice(greenHouseId, res);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: "Failed to connect to GreenHouse device"});
        return;
    }
    res.status(200).json({message: "Connected to GreenHouse device"});
    return;
}

export async function disconnectFromGreenHouse(req: Request, res: Response): Promise<void> {
    const accessToken = req.cookies.accessToken;
    if (!accessToken) {
        res.status(400).json({error: "No access token provided"});
        return;
    }

    const payload = jwt.verify(accessToken, process.env.JWT_AT_SECRET!) as TokenPayLoad;
    if (!payload) {
        res.status(400).json({error: "Invalid access token"});
        return;
    }

    const user = await User.findOne({email: payload.email});
    if (!user || user.isDeleted) {
        res.status(400).json({error: "Unauthorized"});
        return;
    }

    const {greenHouseId} = req.body;
    if (!greenHouseId) {
        res.status(400).json({error: "Missing fields"});
        return;
    }

    try {
        await disconnectFromDevice(greenHouseId, res);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: "Failed to disconnect from GreenHouse device"});
        return;
    }
    res.status(200).json({message: "Disconnected from GreenHouse device"});
    return;
}