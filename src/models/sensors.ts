import mongoose from "mongoose";

interface ISensor {
    _id: mongoose.Types.ObjectId;
    name: string;
    type: string;
    quantity: number;
    technicalSpecifications: {
        powerRequirements: {
            voltageRange: string;
            maxCurrent: string;
        };
        measurementRange: {
            temperature: {
                min: number;
                max: number;
                accuracy: number;
            };
            humidity: {
                min: number;
                max: number;
                accuracy: number;
            };
        };
        samplingRate: number;
        physicalDimensions: {
            length: number;
            width: number;
            height: number;
            unit: string;
        };
        pinConfiguration: {
            count: number;
            spacing: number;
        };
    };
}

const sensorSchema = new mongoose.Schema({ 
    name: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        default: 0,
    },
    technicalSpecifications: {
        powerRequirements: {
            voltageRange: String,
            maxCurrent: String
        },
        measurementRange: {
            temperature: {
                min: Number,
                max: Number,
                accuracy: String
            },
            humidity: {
                min: Number,
                max: Number,
                accuracy: String
            }
        },
        samplingRate: String,
        physicalDimensions: {
            length: Number,
            width: Number,
            height: Number,
            unit: String
        },
        pinConfiguration: {
            count: Number,
            spacing: String
        }
    }
}, {
    timestamps: true
});

export default mongoose.model<ISensor>("Sensor", sensorSchema);
