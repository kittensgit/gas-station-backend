import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        passwordHash: {
            type: String,
            required: true,
        },
        scores: {
            type: Number,
            default: 0,
        },
        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user',
        },
        refuelingHistory: [
            {
                stationName: {
                    type: String,
                    required: true,
                },
                location: {
                    type: String,
                    required: true,
                },
                fuelName: {
                    type: String,
                    required: true,
                },
                litersFilled: {
                    type: Number,
                    required: true,
                },
                cost: {
                    type: Number,
                    required: true,
                },
                refuelDate: {
                    type: Date,
                    default: Date.now(),
                },
            },
        ],
    },
    {
        timestamps: true,
    }
);

export default mongoose.model('User', UserSchema);
