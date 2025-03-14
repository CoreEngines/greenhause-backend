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
        isDeleted: {
            type: Boolean,
            default: false,
        },
        deletedAt: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
);


const softDeletionPeriod = 60 * 5; // 5 minutes (for testing)

greenHouseSchema.index({ deletedAt: 1 }, { expireAfterSeconds: softDeletionPeriod });

export default mongoose.model("GreenHouse", greenHouseSchema);
