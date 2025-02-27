import mongoose from "mongoose";

const greenHouseSchema = new mongoose.Schema(
    {
        location: {
            type: String,
            required: true,
            default: null,
        },
        name: {
            type: String,
            required: true,
            default: null,
        },
        plantType: {
            type: String,
            required: true,
        },
        managerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Manager",
            required: true,
        },
        status: {
            type: String,
            required: false,
            enum: ["active", "inActive"],
            default: "active",
        },
        staffCounf: {
            type: Number,
            required: false,
            default: 0,
        },
    },
    { timestamps: true }
);

export default mongoose.model("GreenHouse", greenHouseSchema);
