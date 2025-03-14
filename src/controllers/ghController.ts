import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import User from "../models/users";
import Manager from "../models/managers";
import GreenHouse from "../models/greenHouses";
import { TokenPayLoad } from "../utils/jwt";

// create a green house
export async function createGreenHouse(
    req: Request,
    res: Response
): Promise<void> {
    const accessToken = req.cookies.accessToken;
    if (!accessToken) {
        res.status(400).json({ error: "No access token provided" });
        return;
    }

    const { plantType, name, location } = req.body;
    if (!plantType || !name || !location) {
        res.status(400).json({ error: "Missing fields" });
        return;
    }

    const payload: TokenPayLoad = jwt.verify(
        accessToken,
        process.env.JWT_AT_SECRET!
    ) as TokenPayLoad;
    if (!payload) {
        res.status(400).json({ error: "Invalid access token" });
        return;
    }

    const user = await User.findOne({ email: payload.email });
    if (!user) {
        res.status(400).json({ error: "User doesn't exist" });
        return;
    }

    if (user.isDeleted) {
        res.status(400).json({ error: "Unauthorized" });
        return;
    }

    if (user.role !== "manager") {
        res.status(400).json({ error: "Unauthorized" });
        return;
    }

    const manager = await Manager.findOne({ userId: user._id });
    if (!manager) {
        res.status(400).json({ error: "Manager doesn't exist" });
        return;
    }
    console.log(manager._id);

    const greenHouse = new GreenHouse({
        location: location,
        name: name,
        plantType: plantType,
        managerId: manager._id,
    });

    await greenHouse.save();


    res.status(200).json(greenHouse);
    return;
}

// get all green houses
export async function getAllGreenHouses(
    req: Request,
    res: Response
): Promise<void> {
    const accessToken = req.cookies.accessToken;
    if (!accessToken) {
        res.status(400).json({ error: "No access token provided" });
        return;
    }

    const payload: TokenPayLoad = jwt.verify(
        accessToken,
        process.env.JWT_AT_SECRET!
    ) as TokenPayLoad;
    if (!payload) {
        res.status(400).json({ error: "Invalid access token" });
        return;
    }

    const user = await User.findOne({ email: payload.email });
    if (!user) {
        res.status(400).json({ error: "User doesn't exist" });
        return;
    }

    if (user.isDeleted) {
        res.status(400).json({ error: "Unauthorized" });
        return;
    }

    if (user.role !== "manager") {
        res.status(400).json({ error: "Unauthorized" });
        return;
    }

    const manager = await Manager.findOne({ userId: user._id });
    if (!manager) {
        res.status(400).json({ error: "Manager doesn't exist" });
        return;
    }

    console.log(manager._id);

    const greenHouses = await GreenHouse.find({ managerId: manager._id });
    if (!greenHouses) {
        res.status(400).json({ error: "No green houses found" });
        return;
    }

    console.log(greenHouses);

    res.status(200).json(greenHouses);
    return;
}

// delete a green house
export async function deleteGreenHouse(req: Request, res: Response){
    const accessToken = req.cookies.accessToken;
    if (!accessToken) {
        res.status(400).json({ error: "No access token provided" });
        return;
    }

    const { id } = req.body;
    if (!id) {
        res.status(400).json({ error: "Missing id" });
        return;
    }

    const payload: TokenPayLoad = jwt.verify(
        accessToken,
        process.env.JWT_AT_SECRET!
    ) as TokenPayLoad;
    if (!payload) {
        res.status(400).json({ error: "Invalid access token" });
        return;
    }

    const user = await User.findOne({ email: payload.email });
    if (!user) {
        res.status(400).json({ error: "User doesn't exist" });
        return;
    }

    if (user.role !== "manager") {
        res.status(400).json({ error: "Unauthorized" });
        return;
    }

    const manager = await Manager.findOne({ userId: user._id });
    if (!manager) {
        res.status(400).json({ error: "Manager doesn't exist" });
        return;
    }

    const greenHouse = await GreenHouse.findOne({ _id: id });
    if (!greenHouse) {
        res.status(400).json({ error: "Green house doesn't exist" });
        return;
    }

    if (greenHouse.managerId.toString() !== manager._id.toString()) {
        res.status(400).json({ error: "Unauthorized" });
        return;
    }

    greenHouse.deletedAt = new Date(Date.now());
    greenHouse.isDeleted = true;
    await greenHouse.save();

    res.status(200).json(greenHouse);
    return;

}



// update a green house
export async function updateGreenHouse(req: Request, res: Response){
    const accessToken = req.cookies.accessToken;
    if (!accessToken) {
        res.status(400).json({ error: "No access token provided" });
        return;
    }

    const { plantType, name, location, id } = req.body;
    if (!plantType || !name || !location || !id) {
        res.status(400).json({ error: "Missing fields" });
        return;
    }

    const payload: TokenPayLoad = jwt.verify(
        accessToken,
        process.env.JWT_AT_SECRET!
    ) as TokenPayLoad;
    if (!payload) {
        res.status(400).json({ error: "Invalid access token" });
        return;
    }

    const user = await User.findOne({ email: payload.email });
    if (!user) {
        res.status(400).json({ error: "User doesn't exist" });
        return;
    }

    if (user.role !== "manager") {
        res.status(400).json({ error: "Unauthorized" });
        return;
    }

    const manager = await Manager.findOne({ userId: user._id });
    if (!manager) {
        res.status(400).json({ error: "Manager doesn't exist" });
        return;
    }

    const greenHouse = await GreenHouse.findOne({ _id: id });
    if (!greenHouse) {
        res.status(400).json({ error: "Green house doesn't exist" });
        return;
    }

    if (greenHouse.managerId.toString() !== manager._id.toString()) {
        res.status(400).json({ error: "Unauthorized" });
        return;
    }

    greenHouse.name = name;
    greenHouse.location = location;
    greenHouse.plantType = plantType;

    await greenHouse.save();

    res.status(200).json(greenHouse);
    return;
}