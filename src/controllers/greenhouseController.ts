import {Request, Response} from "express";
import GreenHouse from "../models/greenHouses";
import Manager from "../models/managers";
import Sensor from "../models/sensors";
import Farmer from "../models/farmers";
import Technician from "../models/technicians";
import GreenHouseStats from "../models/greenHouseStats";
import {ConnectToDevice, disconnectFromDevice} from "../services/mqtt";
import mongoose from "mongoose";
import { validateUser as validateAndGetUser } from "../middlewares/authMiddleware";
import { IUser } from "../models/users";

// create a green house
export async function createGreenHouse(
    req: Request,
    res: Response
): Promise<void> {
    const user = await validateAndGetUser(req, res);
    if (!user) return;

    if (user.role !== "manager") {
        res.status(400).json({error: "Unauthorized"});
        return;
    }

    const {plantType, name, location} = req.body;
    if (!plantType || !name || !location) {
        res.status(400).json({error: "Missing fields"});
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
    const user: IUser | null = await validateAndGetUser(req, res);
    if (!user) return;

    if (user.role !== "manager" && user.role !== "farmer") {
        res.status(400).json({error: "Unauthorized"});
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

export async function deleteGreenHouse(
    req: Request,
    res: Response
): Promise<void> {
    const user = await validateAndGetUser(req, res);
    if (!user) return;

    if (user.role !== "manager") {
        res.status(400).json({error: "Unauthorized"});
        return;
    }

    const manager = await Manager.findOne({userId: user._id});
    if (!manager) {
        res.status(400).json({error: "Manager doesn't exist"});
        return;
    }

    const {id} = req.body;
    if (!id) {
        res.status(400).json({error: "Missing id"});
        return;
    }

    const greenHouse = await GreenHouse.findOne({_id: id});
    if (!greenHouse) {
        res.status(404).json({error: "Greenhouse not found"});
        return;
    }

    if (greenHouse.managerId.toString() !== manager._id.toString()) {
        res.status(400).json({error: "Unauthorized"});
        return;
    }

    try {
        // Soft delete the greenhouse
        greenHouse.isDeleted = true;
        greenHouse.deletedAt = new Date();
        await greenHouse.save();

        // Remove greenhouse from manager's list
        manager.greenHouseIds = manager.greenHouseIds.filter(
            (ghId) => ghId.toString() !== id
        );
        await manager.save();

        // Remove greenhouse from all associated farmers
        await Farmer.updateMany(
            {greenHouseIds: id},
            {$pull: {greenHouseIds: id}}
        );

        // Remove greenhouse from all associated technicians
        await Technician.updateMany(
            {greenHouseIds: id},
            {$pull: {greenHouseIds: id}}
        );

        // Delete all associated greenhouse stats
        await GreenHouseStats.deleteMany({greenHouseId: id});

        res.status(200).json({message: "Greenhouse deleted successfully"});
    } catch (error) {
        console.error("Error deleting greenhouse:", error);
        res.status(500).json({error: "Failed to delete greenhouse"});
    }
}

export async function updateGreenHouse(req: Request, res: Response): Promise<void> {
    const user = await validateAndGetUser(req, res);
    if (!user) return;

    if (user.role !== "manager") {
        res.status(400).json({error: "Unauthorized"});
        return;
    }

    const {plantType, name, location, id} = req.body;
    if (!plantType || !name || !location || !id) {
        res.status(400).json({error: "Missing fields"});
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

export async function AddDeviceToGreenHouse(req: Request, res: Response): Promise<void> {
    const user = await validateAndGetUser(req, res);
    if (!user) return;

    if (user.role !== "manager" && user.role !== "technician") {
        res.status(400).json({error: "Unauthorized"});
        return;
    }

    const {deviceIP, deviceURL, greenHouseId} = req.body;
    if (!deviceIP || !deviceURL || !greenHouseId) {
        res.status(400).json({error: "Missing fields"});
        return;
    }

    const greenHouse = await GreenHouse.findOne({_id: greenHouseId});
    if (!greenHouse) {
        res.status(400).json({error: "Green house doesn't exist"});
        return;
    }

    greenHouse.deviceIP = deviceIP;
    greenHouse.deviceUrl = deviceURL;

    await greenHouse.save();

    res.status(200).json({message: "Device added successfully"});
    return;
}

export async function getGreenHouses(req: Request, res: Response) {
    const user = await validateAndGetUser(req, res);
    if (!user) return;

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
}

export async function getGreenHouseWorkers(req: Request, res: Response): Promise<void> {
    const user = await validateAndGetUser(req, res);
    if (!user) return;

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
}

export async function connectToGreenHouse(req: Request, res: Response): Promise<void> {
    const user = await validateAndGetUser(req, res);
    if (!user) return;

    const {greenHouseId} = req.body;
    if (!greenHouseId) {
        res.status(400).json({error: "Missing fields"});
        return;
    }

    // mqtt connection
    try {
        await ConnectToDevice(greenHouseId, res);
        res.status(200).json({message: "Connected to GreenHouse device"});
        return;
    } catch (error) {
        console.error(error);
        res.status(500).json({error: "Failed to connect to GreenHouse device"});
        return;
    }
}

export async function disconnectFromGreenHouse(req: Request, res: Response): Promise<void> {
    const user = await validateAndGetUser(req, res);
    if (!user) return;

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

export async function seedFakeStats(req: Request, res: Response): Promise<void> {
    const fakeStats = [];
    const greenhouseId = "67fee051186d286bd3a51756";

    const startDate = new Date("2025-01-01");
    const endDate = new Date("2025-12-31");

    for (
        let date = new Date(startDate);
        date <= endDate;
        date.setDate(date.getDate() + 1)
    ) {
        const timestamp = new Date(date); // copy to avoid mutation

        fakeStats.push({
            greenHouseId: greenhouseId,
            temperature: Math.random() * (35 - 15) + 15,
            humidity: Math.random() * (100 - 30) + 30,
            soilMoisture: Math.random() * (100 - 10) + 10,
            ph: Math.random() * (8 - 5.5) + 5.5,
            createdAt: timestamp,
            updatedAt: timestamp,
        });
    }

    await GreenHouseStats.insertMany(fakeStats);
    console.log(`✅ Inserted ${fakeStats.length} fake records for each day of 2025`);
    res.status(200).json({message: "Fake daily stats for 2025 inserted!"});
}

export async function getGreenHouseStats(req: Request, res: Response): Promise<void> {
    const user = await validateAndGetUser(req, res);
    if (!user) return;

    const {greenHouseId} = req.body;
    if (!greenHouseId) {
        res.status(400).json({error: "greenHouseId is required"});
        return;
    }

    if (!mongoose.Types.ObjectId.isValid(greenHouseId)) {
        res.status(400).json({error: "Invalid greenhouse ID"});
        return;
    }

    const stats = await GreenHouseStats.find({greenHouseId}).sort({createdAt: -1});

    if (!stats.length) {
        res.status(404).json({error: "No stats found for this greenhouse"});
        return;
    }

    const formattedStats = stats.map(stat => ({
        date: stat.createdAt.toISOString().split("T")[0], // YYYY-MM-DD
        ph: stat.ph,
        temperature: stat.temperature,
        humidity: stat.humidity,
        soilMoisture: stat.soilMoisture
    }));

    res.status(200).json(formattedStats);
}

export async function getAvgDailyStats(req: Request, res: Response): Promise<void> {
    const user = await validateAndGetUser(req, res);
    if (!user) return;

    const {greenHouseId} = req.body;
    if (!greenHouseId) {
        res.status(400).json({error: "greenHouseId is required"});
        return;
    }

    if (!mongoose.Types.ObjectId.isValid(greenHouseId)) {
        res.status(400).json({error: "Invalid greenhouse ID"});
        return;
    }

    const greenhouse = await mongoose.model("GreenHouse").findById(greenHouseId);
    if (!greenhouse || greenhouse.isDeleted) {
        res.status(404).json({success: false, message: "Greenhouse not found"});
        return;
    }

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const todayAvg = await GreenHouseStats.aggregate([
        {
            $match: {
                greenHouseId: new mongoose.Types.ObjectId(greenHouseId),
                createdAt: {
                    $gte: startOfToday,
                    $lte: endOfToday
                }
            }
        },
        {
            $group: {
                _id: null,
                avgTemperature: {$avg: "$temperature"},
                avgHumidity: {$avg: "$humidity"},
                avgSoilMoisture: {$avg: "$soilMoisture"},
                avgPh: {$avg: "$ph"}
            }
        },
        {
            $project: {
                _id: 0,
                avgTemperature: 1,
                avgHumidity: 1,
                avgSoilMoisture: 1,
                avgPh: 1,
                date: {
                    $dateToString: {format: "%Y-%m-%d", date: new Date()}
                }
            }
        }
    ]);

    res.status(200).json({success: true, data: todayAvg[0] || {}});
}

export async function removeWorkerFromGreenhouse(
    req: Request,
    res: Response
): Promise<void> {
    const user = await validateAndGetUser(req, res);
    if (!user) return;

    if (user.role !== "manager") {
        res.status(400).json({error: "Unauthorized"});
        return;
    }

    const {greenhouseId, workerId, workerType} = req.body;
    if (!greenhouseId || !workerId || !workerType) {
        res.status(400).json({error: "Missing required fields"});
        return;
    }

    if (workerType !== "farmer" && workerType !== "technician") {
        res.status(400).json({error: "Invalid worker type"});
        return;
    }

    const manager = await Manager.findOne({userId: user._id});
    if (!manager) {
        res.status(400).json({error: "Manager doesn't exist"});
        return;
    }

    const greenHouse = await GreenHouse.findById(greenhouseId);
    if (!greenHouse) {
        res.status(404).json({error: "Greenhouse not found"});
        return;
    }

    if (greenHouse.managerId.toString() !== manager._id.toString()) {
        res.status(403).json({error: "Unauthorized to modify this greenhouse"});
        return;
    }

    try {
        if (workerType === "farmer") {
            const farmer = await Farmer.findById(workerId);
            if (!farmer) {
                res.status(404).json({error: "Farmer not found"});
                return;
            }

            // Remove greenhouse from farmer's list
            farmer.greenHouseIds = farmer.greenHouseIds.filter(
                id => id.toString() !== greenhouseId
            );
            await farmer.save();

            // Remove farmer from greenhouse's list
            greenHouse.farmers = greenHouse.farmers.filter(
                id => id.toString() !== workerId
            );
        } else {
            const technician = await Technician.findById(workerId);
            if (!technician) {
                res.status(404).json({error: "Technician not found"});
                return;
            }

            // Remove greenhouse from technician's list
            technician.greenHouseIds = technician.greenHouseIds.filter(
                id => id.toString() !== greenhouseId
            );
            await technician.save();

            // Remove technician from greenhouse's list
            greenHouse.technicians = greenHouse.technicians.filter(
                id => id.toString() !== workerId
            );
        }

        // Update staff count
        greenHouse.staffCount = (greenHouse.farmers?.length || 0) + (greenHouse.technicians?.length || 0);
        await greenHouse.save();

        res.status(200).json({message: "Worker removed successfully"});
    } catch (error) {
        console.error("Error removing worker:", error);
        res.status(500).json({error: "Failed to remove worker"});
    }
}

export async function addSensorToGreenHouse(req: Request, res: Response): Promise<void> {
    const user = await validateAndGetUser(req, res);
    if (!user) return;

    if (user.role !== "manager" && user.role !== "technician") {
        res.status(400).json({error: "Unauthorized"});
        return;
    }

    const {
        greenHouseId,
        name,
        type,
        quantity,
        voltageRange,
        maxCurrent,
        minTemperature,
        maxTemperature,
        accuracyTemperature,
        minHumidity,
        maxHumidity,
        accuracyHumidity,
        samplingRate,
        physicalDimensions_length,
        physicalDimensions_width,
        physicalDimensions_height,
        physicalDimensions_unit,
        pinConfiguration_count,
        pinConfiguration_spacing,
    } = req.body;

    if (
        !greenHouseId ||
        !name ||
        !type ||
        !quantity
    ) {
        res.status(400).json({error: "Missing fields"});
        return;
    }

    const greenHouse = await GreenHouse.findById(greenHouseId);
    if (!greenHouse) {
        res.status(404).json({error: "Greenhouse not found"});
        return;
    }

    
    const sensor = new Sensor({
        name: name,
        type: type,
        quantity: quantity,
        technicalSpecifications: {
            powerRequirements: {
                voltageRange: voltageRange,
                maxCurrent: maxCurrent,
            },
            measurementRange: {
                temperature: {
                    min: minTemperature,
                    max: maxTemperature,
                    accuracy: accuracyTemperature,
                },
            },
            humidity: {
                min: minHumidity,
                max: maxHumidity,
                accuracy: accuracyHumidity,
            },
            samplingRate: samplingRate,
            physicalDimensions: {
                length: physicalDimensions_length,
                width: physicalDimensions_width,
                height: physicalDimensions_height,
                unit: physicalDimensions_unit,
            },
            pinConfiguration: {
                count: pinConfiguration_count,
                spacing: pinConfiguration_spacing,
            },
        },
    });

    await sensor.save();

    greenHouse.sensors.push(sensor._id);
    await greenHouse.save();

    res.status(200).json({message: "Sensor added successfully"});
    return;
}

export async function getGreenHouseSensors(req: Request, res: Response): Promise<void> {
    const user = await validateAndGetUser(req, res);
    if (!user) return;

    const {greenHouseId} = req.body;

    if (!greenHouseId) {
        res.status(400).json({error: "Missing fields"});
        return;
    }

    const greenHouse = await GreenHouse.findById(greenHouseId);
    if (!greenHouse) {
        res.status(404).json({error: "Greenhouse not found"});
        return;
    }

    const sensorIds = greenHouse.sensors;

    const sensors = await Sensor.find({_id: {$in: sensorIds}});

    if (!sensors) {
        res.status(404).json({error: "No sensors found"});
        return;
    }

    res.status(200).json(sensors);
    return;
}
