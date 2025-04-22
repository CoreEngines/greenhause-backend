import mongoose from "mongoose";

export interface IUser {
    _id: mongoose.Types.ObjectId;
    name: string;
    email: string;
    password: string | null;
    role: "manager" | "farmer" | "technician";
    isAdmin: boolean;
    isVerified: boolean;
    avatar: string | null;
    isDeleted: boolean;
    providers: Array<{
        providerId: string;
        providerName: "local" | "google" | "github";
    }>;
    deletedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

const userSchema = new mongoose.Schema<IUser>(
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
        avatar: {
            type: String,
            default: null,
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

export default mongoose.model<IUser>("User", userSchema);
