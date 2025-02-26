import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
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
        role: {
            type: String,
            default: null,
            enum: ["manager", "farmer", "technician"],
            required: true,
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
        providers: [
            {
                providerId: {
                    type: String,
                    required: true,
                    default: null,
                },
                providerName: {
                    type: String,
                    required: true,
                    enum: ["local", "google", "github"],
                    default: "local",
                },
            },
        ],
        deletedAt: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
);

const softDeletionPeriod = 60 * 5; // 5 minutes (for testing)

userSchema.index({ deletedAt: 1 }, { expireAfterSeconds: softDeletionPeriod });

userSchema.index({ "providers.providerId": 1 }, { unique: true, sparse: true });

export default mongoose.model("User", userSchema);
