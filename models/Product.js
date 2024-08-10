import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        scoresCount: {
            type: Number,
            required: true,
        },
        type: {
            type: String,
            enum: ['dessert', 'main', 'drinks'],
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model('Product', ProductSchema);
