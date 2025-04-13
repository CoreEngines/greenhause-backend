import {Router} from 'express';
import {reportAlertController} from "../controllers/reportAlertController";

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

export default reportsAlertsRouter;