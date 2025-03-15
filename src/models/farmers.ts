import mongoose from "mongoose";

const farmerSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true,
    },
    greenHouseIds: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "GreenHouse",
        },
    ],
});

export default mongoose.model("Farmer", farmerSchema);
