import {Router} from 'express';
import { createReport, deleteReport, getAllReports, updateReport } from '../controllers/reportController';

const reportsRouter = Router();

/**
 * @swagger
 * /reports/create-report:
 *   post:
 *     summary: Create a new report
 *     tags: [Reports]
 *     description: Endpoint to create a new report for a specific greenhouse. Only authenticated users can create reports.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               greenhouseId:
 *                 type: string
 *                 description: The ID of the greenhouse the report is about.
 *               title:
 *                 type: string
 *                 description: Title of the report.
 *               description:
 *                 type: string
 *                 description: Detailed description of the report.
 *             required:
 *               - greenhouseId
 *               - title
 *               - description
 *     responses:
 *       201:
 *         description: Report created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 greenhouseId:
 *                   type: string
 *                 title:
 *                   type: string
 *                 description:
 *                   type: string
 *                 userId:
 *                   type: string
 *                 date:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Bad request or missing fields
 *       401:
 *         description: Unauthorized (User not authenticated)
 *       500:
 *         description: Internal server error
 */
reportsRouter.post("/create-report", createReport);

/**
 * @swagger
 * /reports/get-reports:
 *   post:
 *     summary: Get all reports for a greenhouse (Manager only)
 *     tags: [Reports]
 *     description: Retrieve all reports for a specific greenhouse. Only accessible to users with the "manager" role.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               greenhouseId:
 *                 type: string
 *                 description: The ID of the greenhouse to fetch reports for.
 *             required:
 *               - greenhouseId
 *     responses:
 *       200:
 *         description: List of reports retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   title:
 *                     type: string
 *                   description:
 *                     type: string
 *                   date:
 *                     type: string
 *                     format: date-time
 *                   userId:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       email:
 *                         type: string
 *                   greenhouseId:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       location:
 *                         type: string
 *       400:
 *         description: Unauthorized or invalid manager
 *       401:
 *         description: Unauthorized (User not authenticated)
 *       500:
 *         description: Internal server error
 */
reportsRouter.post("/get-reports", getAllReports);


/**
 * @swagger
 * /reports/delete-reports:
 *   post:
 *     summary: Delete a report (Manager only)
 *     tags: [Reports]
 *     description: Deletes a report based on the given report ID. Only accessible to users with the "manager" role.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reportId
 *             properties:
 *               reportId:
 *                 type: string
 *                 description: The ID of the report to delete.
 *                 example: 6633a2a5c4f1a5d74b65f4e1
 *     responses:
 *       200:
 *         description: Report deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Report deleted successfully
 *       400:
 *         description: Unauthorized or manager not found
 *       401:
 *         description: Unauthorized (User not authenticated)
 *       404:
 *         description: Report or greenhouse not found
 *       500:
 *         description: Internal server error
 */
reportsRouter.post('/delete-reports', deleteReport);


/**
 * @swagger
 * /reports/mark-read:
 *   post:
 *     summary: Update a report (Manager only)
 *     tags: [Reports]
 *     description: Update a report’s title, description, or urgency. Only accessible to users with the "manager" role and ownership of the greenhouse.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reportId
 *             properties:
 *               reportId:
 *                 type: string
 *                 description: The ID of the report to update.
 *                 example: 6633a2a5c4f1a5d74b65f4e1
 *               title:
 *                 type: string
 *                 description: New title for the report.
 *                 example: Water system failure
 *               description:
 *                 type: string
 *                 description: New description for the report.
 *                 example: The automatic watering system failed overnight.
 *               urgency:
 *                 type: string
 *                 enum: [low, medium, high]
 *                 description: New urgency level.
 *                 example: high
 *     responses:
 *       200:
 *         description: Report updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Report updated successfully
 *                 report:
 *                   $ref: '#/components/schemas/Report'
 *       400:
 *         description: Unauthorized or manager not found
 *       401:
 *         description: Unauthorized (User not authenticated)
 *       403:
 *         description: Access denied
 *       404:
 *         description: Report or greenhouse not found
 *       500:
 *         description: Internal server error
 */
reportsRouter.post('/mark-read', updateReport);



export default reportsRouter;