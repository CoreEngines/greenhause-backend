import mongoose from "mongoose";

const technicianSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },
    },
    { timestamps: true }
);

export default mongoose.model("Technician", technicianSchema);
