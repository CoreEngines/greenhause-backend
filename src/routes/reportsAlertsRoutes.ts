import {Router} from 'express';
import {getAllAlerts, reportAlertController} from "../controllers/reportAlertController";

const reportsAlertsRouter = Router();

/**
 * @swagger
 * /reports-alerts:
 *   post:
 *     summary: Report an alert
 *     tags: [Reports & Alerts]
 *     description: Endpoint to report an alert for a greenhouse or related system.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               greenhouseId:
 *                 type: string
 *                 description: The ID of the greenhouse.
 *               alertType:
 *                 type: string
 *                 description: The type of alert (e.g., temperature, humidity).
 *               message:
 *                 type: string
 *                 description: A detailed message about the alert.
 *             required:
 *               - greenhouseId
 *               - alertType
 *               - message
 *     responses:
 *       200:
 *         description: Alert reported successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Alert reported successfully"
 *       400:
 *         description: Invalid input data
 *       500:
 *         description: Internal server error
 */
reportsAlertsRouter.post("/alert-issue", reportAlertController);


/**
 * @swagger
 * /reports-alerts/all-alerts:
 *   post:
 *     summary: Get all alerts for a greenhouse
 *     tags: [Reports & Alerts]
 *     description: Retrieve all alerts associated with a specific greenhouse.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               greenHouseId:
 *                 type: string
 *                 description: The ID of the greenhouse.
 *             required:
 *               - greenHouseId
 *     responses:
 *       200:
 *         description: Successfully retrieved alerts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 alerts:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       greenHouseId:
 *                         type: string
 *                       alertType:
 *                         type: string
 *                       title:
 *                         type: string
 *                       description:
 *                         type: string
 *                       status:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       400:
 *         description: Invalid input data or greenhouse not found
 *       500:
 *         description: Internal server error
 */
reportsAlertsRouter.post("/all-alerts", getAllAlerts);

export default reportsAlertsRouter;