import mongoose from 'mongoose';

const OrderedProductSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        orders: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Product',
                    required: true,
                },
                quantity: {
                    type: Number,
                    required: true,
                },
                totalScores: {
                    type: Number,
                    required: true,
                },
                statusReady: {
                    type: Boolean,
                    default: false,
                },
                readyTime: {
                    type: Date,
                    default: null,
                },
                endReadyTime: {
                    type: Date,
                    default: null,
                },
                orderDate: {
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

export default mongoose.model('OrderedProduct', OrderedProductSchema);
