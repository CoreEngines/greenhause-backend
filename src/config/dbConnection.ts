import mongoose from "mongoose";

export async function connectDB() {
    try {
       const connection = await mongoose.connect(process.env.DATABASE_URI!);
    } catch (error) {
       console.log(error);
    }
};