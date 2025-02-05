import rateLimit from "express-rate-limit";

export const appRateLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 1 minutes
    max: 5, // let the user with 5 max requests 
    message: "Too many login attempts, please try again after 5 minutes",
    standardHeaders: true, 
    legacyHeaders: false, 
});