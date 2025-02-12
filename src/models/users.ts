import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        default: null,
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    providers: [{
        providerId: {
            type: String,
            required: true,
            unique: true,
            default: false
        },
        providerName: {
            type: String,
            required: true,
            enum: ["local", "google","github"],
            default: "local"
        },
    }],
    createdAt: {
        type: Date,
        default: Date.now(),
    },
    updatedAt: {
        type: Date,
        default: Date.now(),
    },
    deletedAt: {
        type: Date,
        default: null,
    },
});

const softDeletionPeriod = 60 * 5;// 5 minutes (for testing)

userSchema.index({deletedAt: 1}, { expireAfterSeconds: softDeletionPeriod});

export default mongoose.model("User", userSchema);