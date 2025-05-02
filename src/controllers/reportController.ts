import { Request, Response } from "express";
import Report from "../models/report";
import {validateUser as validateAndGetUser} from "../middlewares/authMiddleware";
import Manager from "../models/managers";
import greenHouses from "../models/greenHouses";


// Create a new report
export async function createReport(req: Request, res: Response): Promise<void> {
    try {
        const { greenhouseId, title, description, urgency } = req.body;
        const user = await validateAndGetUser(req, res);
        const greenhouse = await greenHouses.findOne({_id: greenhouseId})

        if (!user) {
            res.status(401).json({ error: "Unauthorized" });
            return; 
        }

        if (!greenhouse) {
            res.status(401).json({ error: "Unauthorized" });
            return; 
        }

        const newReport = new Report({
            userId: user._id,
            userName: user.name,
            greenhouseId,
            greenhouseName: greenhouse.name,
            title,
            urgency,
            description,
            date: new Date(),
        });

        await newReport.save();
        res.status(201).json(newReport);
    } catch (error) {
        console.error("Error creating report:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Get reports by greenhouse ID
export async function getAllReports(req: Request, res: Response): Promise<void> {
    const user = await validateAndGetUser(req, res);
    if (!user) {
        res.status(401).json({ error: "Unauthorized" });
        return; 
    }
    try {
        if (user.role !== "manager") {
            res.status(400).json({error: "Unauthorized"});
            return;
        }
    
        const manager = await Manager.findOne({userId: user._id});
        if (!manager) {
            res.status(400).json({error: "Manager doesn't exist"});
            return;
        }
        const { greenhouseId } = req.body;


        const reports = await Report.find({ greenhouseId:greenhouseId })
        
        res.status(200).json(reports);
    } catch (error) {
        console.error("Error fetching greenhouse reports:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export async function deleteReport(req: Request, res: Response): Promise<void> {
    try {
        const { reportId } = req.body;
        const user = await validateAndGetUser(req, res);

        if (!user) {
            res.status(401).json({ error: "Unauthorized" });
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

        const report = await Report.findById(reportId);

        
        if (!report) {
            res.status(404).json({ error: "Report not found" });
            return;
        }
        
        const greenhouse = await greenHouses.findById(report.greenhouseId); 
        
        if (!greenhouse) {
            res.status(404).json({ error: "Greenhouse not found" });
            return;
        }

        await Report.deleteOne({ _id: reportId });
        res.status(200).json({ message: "Report deleted successfully" });

    } catch (error) {
        console.error("Error deleting report:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}


export async function updateReport(req: Request, res: Response): Promise<void> {
    try {
        const { reportId } = req.body;
        const user = await validateAndGetUser(req, res);

        if (!user) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        if (user.role !== "manager") {
            res.status(403).json({ error: "Unauthorized" });
            return;
        }

        const manager = await Manager.findOne({ userId: user._id });
        if (!manager) {
            res.status(400).json({ error: "Manager doesn't exist" });
            return;
        }

        const report = await Report.findById(reportId);
        if (!report) {
            res.status(404).json({ error: "Report not found" });
            return;
        }

        const greenhouse = await greenHouses.findById(report.greenhouseId);
        if (!greenhouse) {
            res.status(404).json({ error: "Greenhouse not found" });
            return;
        }

        if (greenhouse.managerId.toString() !== manager._id.toString()) {
            res.status(403).json({ error: "Unauthorized" });
            return;
        }

        // Update fields if provided
        report.resolved = "read";

        await report.save();

        res.status(200).json({ message: "Report updated successfully", report });

    } catch (error) {
        console.error("Error updating report:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

