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
        deviceUrl: {
            type: String,
            required: false,
            default: "mqtt://192.168.100.23",
        },
        farmers: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Farmer",
            },
        ],
        technicians: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Technician",
            },
        ],
        staffCount: {
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
    {timestamps: true}
);


const softDeletionPeriod = 60 * 5; // 5 minutes (for testing)
greenHouseSchema.index({deletedAt: 1}, {expireAfterSeconds: softDeletionPeriod});


greenHouseSchema.pre("save", function (next) {
    this.staffCount = (this.farmers?.length || 0) + (this.technicians?.length || 0);
    next();
});

greenHouseSchema.post("findOneAndUpdate", async function (doc) {
    if (doc) {
        const updatedGreenHouse = await mongoose.model("GreenHouse").findById(doc._id);
        if (updatedGreenHouse) {
            updatedGreenHouse.staffCount = (updatedGreenHouse.farmers?.length || 0) + (updatedGreenHouse.technicians?.length || 0);
            await updatedGreenHouse.save();
        }
    }
});

export default mongoose.model("GreenHouse", greenHouseSchema);
