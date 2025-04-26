import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        greenhouseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "GreenHouse",
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        date: {
            type: Date,
            default: Date.now,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
    }, {timestamps: true}
);

export default mongoose.model("report", reportSchema);