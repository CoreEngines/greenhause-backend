import mongoose from "mongoose";    

const verificationTokensSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 1800, // 30 minutes
    },
});

export default mongoose.model("VerificationToken", verificationTokensSchema);