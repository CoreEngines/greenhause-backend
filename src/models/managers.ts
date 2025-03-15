import mongoose from "mongoose";

const managerSchema = new mongoose.Schema(
    {
        organization: {
            type: String,
            required: false,
        },
        phone: {
            type: String,
            required: false,
        },
        officeAddress: {
            type: String,
            required: false,
        },
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
            }
        ],
    },
    {timestamps: true}
);

export default mongoose.model("Manager", managerSchema);
