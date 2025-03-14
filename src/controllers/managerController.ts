import {Request, Response} from "express";
import jwt from "jsonwebtoken";
import {TokenPayLoad} from "../utils/jwt";
import User from "../models/users";
import Farmer from "../models/farmers";
import Manager from "../models/managers";
import Greenhouse from "../models/greenHouses";
import Technician from "../models/technicians";
import {hashPassword} from "../utils/hash";

export async function AddFarmer(req: Request, res: Response): Promise<void> {
    try {
        const accessToken = req.cookies.accessToken;
        if (!accessToken) {
            res.status(400).json({error: "No access token provided"});
            return;
        }

        const payload = jwt.verify(
            accessToken,
            process.env.JWT_AT_SECRET!
        ) as TokenPayLoad;
        if (!payload) {
            res.status(400).json({error: "Invalid access token"});
            return;
        }

        const user = await User.findOne({email: payload.email});
        if (!user || user.isDeleted) {
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

        const {farmerName, farmerEmail, greenHouseId} = req.body;
        if (!farmerEmail || !greenHouseId || !farmerName) {
            res.status(400).json({
                error: "Missing farmer name, email or greenhouse ID",
            });
            return;
        }

        let farmerUser = await User.findOne({email: farmerEmail});

        if (!farmerUser) {
            // Generate random password
            const randomPassword = Math.random().toString(36).slice(-8);
            console.log(randomPassword);
            const hashedPassword = await hashPassword(randomPassword);

            // Create new farmer user
            farmerUser = new User({
                name: farmerName,
                email: farmerEmail,
                password: hashedPassword,
                role: "farmer",
                isVerified: true,
            });

            await farmerUser.save();
        }

        // Check if the farmer is already assigned to the greenhouse
        const existingFarmer = await Farmer.findOne({
            userId: farmerUser._id,
            greenHouseId,
        });

        if (existingFarmer) {
            res.status(400).json({
                error: "Farmer is already in the greenhouse",
            });
            return;
        }

        // Assign farmer to greenhouse
        const newFarmer = new Farmer({
            userId: farmerUser._id,
            greenHouseId,
        });

        await newFarmer.save();

        res.status(201).json({
            message: "Farmer added successfully",
            farmer: farmerUser,
        });
        return;
    } catch (error) {
        console.error(error);
        res.status(500).json({error: "Internal server error"});
        return;
    }
}

export async function AddTechnician(req: Request, res: Response): Promise<void> {
    try {
        const accessToken = req.cookies.accessToken;
        if (!accessToken) {
            res.status(400).json({error: "No access token provided"});
            return;
        }

        const payload = jwt.verify(
            accessToken,
            process.env.JWT_AT_SECRET!
        ) as TokenPayLoad;
        if (!payload) {
            res.status(400).json({error: "Invalid access token"});
            return;
        }

        const user = await User.findOne({email: payload.email});
        if (!user || user.isDeleted) {
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

        const {technicianName, technicianEmail, greenHouseId} = req.body;
        if (!technicianEmail || !greenHouseId || !technicianName) {
            res.status(400).json({
                error: "Missing technician name, email or greenhouse ID",
            });
            return;
        }

        let technicianUser = await User.findOne({email: technicianEmail});

        if (!technicianUser) {
            // Generate random password
            const randomPassword = Math.random().toString(36).slice(-8);
            console.log(randomPassword);
            const hashedPassword = await hashPassword(randomPassword);

            // Create new technician user
            technicianUser = new User({
                name: technicianName,
                email: technicianEmail,
                password: hashedPassword,
                role: "technician",
                isVerified: true,
            });

            await technicianUser.save();
        }

        // Check if the technician is already assigned to the greenhouse
        const existingTechnician = await Technician.findOne({
            userId: technicianUser._id,
            greenHouseId,
        });

        if (existingTechnician) {
            res.status(400).json({
                error: "Technician is already in the greenhouse",
            });
            return;
        }

        // Assign technician to greenhouse
        const newTechnician = new Technician({
            userId: technicianUser._id,
            greenHouseId,
        });

        await newTechnician.save();

        res.status(201).json({
            message: "Technician added successfully",
            technician: technicianUser,
        });
        return;
    } catch (error) {
        console.error(error);
        res.status(500).json({error: "Internal server error"});
        return;
    }
}

export async function getAllWorkers(
    req: Request,
    res: Response
): Promise<void> {
    try {
        const accessToken = req.cookies.accessToken;
        if (!accessToken) {
            res.status(401).json({error: "No access token provided"});
            return;
        }

        const payload = jwt.verify(
            accessToken,
            process.env.JWT_AT_SECRET!
        ) as TokenPayLoad;

        const user = await User.findOne({email: payload.email});
        if (!user || user.isDeleted) {
            res.status(403).json({error: "Unauthorized"});
            return;
        }

        if (user.role !== "manager") {
            res.status(403).json({error: "Forbidden"});
            return;
        }

        const manager = await Manager.findOne({userId: user._id});
        if (!manager) {
            res.status(403).json({error: "Manager doesn't exist"});
            return;
        }

        // Get all greenhouses managed by this manager
        const greenhouses = await Greenhouse.find({managerId: manager._id}).select("_id");

        if (greenhouses.length === 0) {
            res.status(200).json({workers: []});
            return;
        }

        const greenhouseIds = greenhouses.map((gh) => gh._id);

        // Get all farmers with user details
        const farmers = await Farmer.find({
            greenHouseId: {$in: greenhouseIds},
        })
            .populate("userId", "name email role") // Select only needed fields
            .select("-password");

        // Get all technicians with user details
        const technicians = await Technician.find({
            greenHouseId: {$in: greenhouseIds},
        })
            .populate("userId", "name email role") // Select only needed fields
            .select("-password");

        // Merge farmers and technicians into one workers array
        const workers = [...farmers, ...technicians];

        res.status(200).json({workers});
    } catch (error) {
        console.error("Error fetching workers:", error);
        res.status(500).json({error: "Internal server error"});
    }
}