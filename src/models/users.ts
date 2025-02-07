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
            enum: ["local", "google"],
            default: "local"
        },
    }]
});

export default mongoose.model("User", userSchema);