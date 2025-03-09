import mongoose from "mongoose";

const farmerSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true,
    },
    greenHouseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "GreenHouse",
        required: true,
        unique: true,
    },
});

export default mongoose.model("Farmer", farmerSchema);
