import mongoose from 'mongoose';

const SettingsSchema = new mongoose.Schema(
    {
        machinePrice: {
            type: Number,
            required: true,
            default: 1000,
        },
        showerPrice: {
            type: Number,
            required: true,
            default: 1000,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model('Settings', SettingsSchema);
