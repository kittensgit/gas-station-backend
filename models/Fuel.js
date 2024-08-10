import mongoose from 'mongoose';

const FuelSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            require: true,
        },
        logo: {
            type: String,
            require: true,
        },
        color: {
            type: String,
            require: true,
        },
        discount: {
            type: Number,
            require: true,
        },
        price: {
            type: Number,
            require: true,
        },
        scores: {
            type: Number,
            require: true,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model('Fuel', FuelSchema);
