import mongoose from 'mongoose';

const MachineSchema = new mongoose.Schema(
    {
        occupied: {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                default: null,
            },
            bookedAt: { type: Date, default: null },
            bookedUntil: { type: Date, default: null },
        },
        cost: {
            type: Number,
            default: 1000,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model('Machine', MachineSchema);
