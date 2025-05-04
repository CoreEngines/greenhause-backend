import {Request, Response} from "express";
import User from "../models/users";
import Farmer from "../models/farmers";
import Manager from "../models/managers";
import Greenhouse from "../models/greenHouses";
import Technician from "../models/technicians";
import {hashPassword} from "../utils/hash";
import mongoose from "mongoose";
import {validateUser as validateAndGetUser} from "../middlewares/authMiddleware";

export async function AddFarmer(req: Request, res: Response): Promise<void> {
    const user = await validateAndGetUser(req, res);
    if (!user || user.role !== "manager") {
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
            error: "Missing farmer name, email, or greenhouse ID",
        });
        return;
    }

    let farmerUser = await User.findOne({email: farmerEmail});

    if (!farmerUser) {
        // Generate a random password for a new user
        // Use the following hardcoded password for testing purposes (Uncomment if needed)
        const randomPassword = "aptget123";
        // const randomPassword = Math.random().toString(36).slice(-8);
        console.log(randomPassword);

        const hashedPassword = await hashPassword(randomPassword);

        // Create a new farmer user
        farmerUser = new User({
            name: farmerName,
            email: farmerEmail,
            password: hashedPassword,
            role: "farmer",
            isVerified: true,
        });

        await farmerUser.save();
    }

    farmerUser.avatar = `https://avatar.iran.liara.run/public/boy?username=${farmerUser._id}`;
    await farmerUser.save();

    // Find or create the farmer record
    let farmer = await Farmer.findOne({userId: farmerUser._id});

    if (farmer) {
        // Check if the farmer is already assigned to the greenhouse
        if (farmer.greenHouseIds.includes(greenHouseId)) {
            res.status(400).json({error: "Farmer is already in the greenhouse"});
            return;
        }

        // Add the new greenhouse ID to the farmer's list
        farmer.greenHouseIds.push(greenHouseId);
        await farmer.save();
    } else {
        // Create a new farmer record
        farmer = new Farmer({
            userId: farmerUser._id,
            greenHouseIds: [greenHouseId],
        });
        await farmer.save();
    }

    // Update the GreenHouse document to include the farmer
    const greenHouse = await Greenhouse.findById(greenHouseId);
    if (!greenHouse) {
        res.status(400).json({error: "Greenhouse not found"});
        return;
    }

    if (!greenHouse.farmers.includes(farmer._id)) {
        greenHouse.farmers.push(farmer._id);
    }

    // Update staff count before saving
    greenHouse.staffCount = (greenHouse.farmers?.length || 0) + (greenHouse.technicians?.length || 0);
    await greenHouse.save();

    res.status(201).json({
        message: "Farmer added successfully",
        farmer: farmerUser,
    });
}

export async function AddTechnician(req: Request, res: Response): Promise<void> {
    const user = await validateAndGetUser(req, res);
    if (!user || user.role !== "manager") {
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
            error: "Missing technician name, email, or greenhouse ID",
        });
        return;
    }

    let technicianUser = await User.findOne({email: technicianEmail});

    if (!technicianUser) {
        // Generate a random password for a new user
        // const randomPassword = Math.random().toString(36).slice(-8);
        const randomPassword = "aptget123";
        console.log(randomPassword);
        const hashedPassword = await hashPassword(randomPassword);

        // Create a new technician user
        technicianUser = new User({
            name: technicianName,
            email: technicianEmail,
            password: hashedPassword,
            role: "technician",
            isVerified: true,
        });

        await technicianUser.save();
    }

    technicianUser.avatar = `https://avatar.iran.liara.run/public/boy?username=${technicianUser._id}`;
    await technicianUser.save();

    // Find or create the technician record
    let technician = await Technician.findOne({userId: technicianUser._id});

    if (technician) {
        // Check if the technician is already assigned to the greenhouse
        if (technician.greenHouseIds.includes(greenHouseId)) {
            res.status(400).json({error: "Technician is already in the greenhouse"});
            return;
        }

        // Add the new greenhouse ID to the technician's list
        technician.greenHouseIds.push(greenHouseId);
        await technician.save();
    } else {
        // Create a new technician record
        technician = new Technician({
            userId: technicianUser._id,
            greenHouseIds: [greenHouseId],
        });
        await technician.save();
    }

    // Update the GreenHouse document to include the technician
    const greenHouse = await Greenhouse.findById(greenHouseId);
    if (!greenHouse) {
        res.status(400).json({error: "Greenhouse not found"});
        return;
    }

    if (!greenHouse.technicians.includes(technician._id)) {
        greenHouse.technicians.push(technician._id);
    }

    // Update staff count before saving
    greenHouse.staffCount = (greenHouse.farmers?.length || 0) + (greenHouse.technicians?.length || 0);
    await greenHouse.save();

    res.status(201).json({
        message: "Technician added successfully",
        technician: technicianUser,
    });
}

export async function getAllWorkers(
    req: Request,
    res: Response
): Promise<void> {
    const user = await validateAndGetUser(req, res);
    if (!user || user.role !== "manager") {
        res.status(403).json({error: "Unauthorized"});
        return;
    }

    const manager = await Manager.findOne({userId: user._id});
    if (!manager) {
        res.status(403).json({error: "Manager doesn't exist"});
        return;
    }

    // Get all greenhouses managed by this manager
    const greenhouses = await Greenhouse.find({managerId: manager._id});

    if (greenhouses.length === 0) {
        res.status(200).json({workers: []});
        return;
    }

    // Collect all farmer and technician IDs from the greenhouses
    const farmerIds: mongoose.Types.ObjectId[] = [];
    const technicianIds: mongoose.Types.ObjectId[] = [];

    greenhouses.forEach((greenhouse) => {
        if (greenhouse.farmers) {
            farmerIds.push(...greenhouse.farmers);
        }
        if (greenhouse.technicians) {
            technicianIds.push(...greenhouse.technicians);
        }
    });

    // Fetch all farmers and technicians
    const farmers = await Farmer.find({_id: {$in: farmerIds}})
        .populate("userId", "name email role -_id") // Populate user details
        .lean();

    const technicians = await Technician.find({_id: {$in: technicianIds}})
        .populate("userId", "name email role -_id") // Populate user details
        .lean();

    // Combine farmers and technicians
    const workers = [...farmers, ...technicians];

    res.status(200).json({workers});
}

export async function getAllManagerGrennhouses(
    req: Request,
    res: Response
): Promise<void> {
    const user = await validateAndGetUser(req, res);
    if (!user || user.role !== "manager") {
        res.status(400).json({error: "Unauthorized"});
        return;
    }

    const manager = await Manager.findOne({userId: user._id});
    if (!manager) {
        res.status(400).json({error: "Manager doesn't exist"});
        return;
    }

    const greenhouses = await Greenhouse.find({managerId: manager._id});

    res.status(200).json({greenhouses});
    return;
}
//removeworker
export async function removeWorkerFromGreenhouse(req: Request, res: Response): Promise<void> {
    const user = await validateAndGetUser(req, res);
    if (!user || user.role !== "manager") {
        res.status(403).json({error: "Unauthorized"});
        return;
    }

    const manager = await Manager.findOne({userId: user._id});
    if (!manager) {
        res.status(403).json({error: "Manager doesn't exist"});
        return;
    }

    const {workerId, workerType, greenhouseId} = req.body;

    if (!workerId || !workerType || !greenhouseId) {
        res.status(400).json({error: "Missing required fields"});
        return;
    }

    if (!["farmer", "technician"].includes(workerType)) {
        res.status(400).json({error: "Invalid worker type"});
        return;
    }

    const greenhouse = await Greenhouse.findById(greenhouseId);
    if (!greenhouse) {
        res.status(404).json({error: "Greenhouse not found"});
        return;
    }

    if (greenhouse.managerId.toString() !== manager._id.toString()) {
        res.status(403).json({error: "Unauthorized to modify this greenhouse"});
        return;
    }

    if (workerType === "farmer") {
        const farmer = await Farmer.findById(workerId);
        if (!farmer) {
            res.status(404).json({error: "Worker not found"});
            return;
        }

        farmer.greenHouseIds = farmer.greenHouseIds.filter(id => id.toString() !== greenhouseId);
        await farmer.save();

        greenhouse.farmers = greenhouse.farmers.filter(id => id.toString() !== farmer._id.toString());

    } else if (workerType === "technician") {
        const technician = await Technician.findById(workerId);
        if (!technician) {
            res.status(404).json({error: "Worker not found"});
            return;
        }

        technician.greenHouseIds = technician.greenHouseIds.filter(id => id.toString() !== greenhouseId);
        await technician.save();

        greenhouse.technicians = greenhouse.technicians.filter(id => id.toString() !== technician._id.toString());
    }

    greenhouse.staffCount = (greenhouse.farmers?.length || 0) + (greenhouse.technicians?.length || 0);
    await greenhouse.save();

    res.status(200).json({message: "Worker removed successfully"});
}