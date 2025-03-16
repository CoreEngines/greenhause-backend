import { Request, Response, NextFunction } from "express";
import { z } from "zod";

export const signUpSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    email: z.string().email({ message: "Invalid email format" }),
    password: z.string().min(8, { message: "Password must be at least 8 characters long" }),
});

export const email = z.object({
    email: z.string().email({ message: "Invalid email format" }),
});

export function validateRequestBody(schema: z.ZodSchema) {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            schema.parse(req.body);
            next(); 
        } catch (error) {
            if (error instanceof z.ZodError) {
                const errors = error.errors.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message,
                }));
                res.status(400).json({
                    message: "Validation failed",
                    errors,
                });
                return;
            }
            res.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }
    };
}
