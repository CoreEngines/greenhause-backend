import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema({
    greenHouseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'GreenHouse',
        required: true,
    },
    alertType: {
        type: String,
        required: true,
        enum: ['temperature', 'humidity', 'soilMoisture', 'ph'],
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
}, {timestamps: true});

export default mongoose.model('Alert', alertSchema);