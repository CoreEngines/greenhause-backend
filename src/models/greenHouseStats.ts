import mongoose from "mongoose";

const greenHouseStatsSchema = new mongoose.Schema({
        greenHouseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "GreenHouse",
            required: true,
        },
        temperature: {
            type: Number,
            required: true,
        },
        humidity: {
            type: Number,
            required: true,
        },
        soilMoisture: {
            type: Number,
            required: true,
        },
        ph: {
            type: Number,
            required: true,
        }
    }, {timestamps: true}
);

export default mongoose.model("GreenHouseStats", greenHouseStatsSchema);