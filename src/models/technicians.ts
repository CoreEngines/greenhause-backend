import mongoose from "mongoose";

const technicianSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },
        status: {
            type: String,
            required: false,
            enum: ["active", "pending"],
            default: "pending",
        },
        greenHouseIds: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "GreenHouse",
            },
        ],
    },
    { timestamps: true }
);

export default mongoose.model("Technician", technicianSchema);
