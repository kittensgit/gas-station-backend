import cron from 'node-cron';

import UserModel from '../models/User.js';
import ProductModel from '../models/Product.js';
import OrderedProductModel from '../models/OrderedProduct.js';

export const orderProduct = async (req, res) => {
    try {
        const userId = req.userId;
        const productId = req.params.productId;
        const quantity = req.body.quantity;

        const user = await UserModel.findById(userId);

        if (!user) return res.status(404).json({ message: 'User not found' });

        const product = await ProductModel.findById(productId);

        const totalScores = product.scoresCount * quantity;

        if (!product)
            return res.status(404).json({
                message: 'Product not found',
            });

        if (user.scores >= product.scoresCount) {
            user.scores = user.scores - totalScores;
            await user.save();
        } else {
            return res.status(400).json({
                message: "You don't have enough points",
            });
        }

        const userOrder = await OrderedProductModel.findOne({
            user: userId,
        });

        const newProduct = {
            product: productId,
            quantity,
            totalScores,
            orderDate: new Date(),
        };

        if (userOrder) {
            userOrder.orders.push(newProduct);

            await userOrder.save();
        } else {
            const newOrderedProduct = new OrderedProductModel({
                user: userId,
                orders: [newProduct],
            });

            await newOrderedProduct.save();
        }

        res.json({
            message: `Product ordered successfully and you spent ${totalScores} points`,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Failed to get product',
        });
    }
};

export const getUserOrders = async (req, res) => {
    try {
        const userOrder = await OrderedProductModel.findOne({
            user: req.params.userId,
        })
            .populate('orders.product')
            .exec();

        if (userOrder) {
            const sortedOrders = userOrder.orders.sort(
                (a, b) => b.orderDate - a.orderDate
            );

            return res.json(sortedOrders);
        }

        res.json([]);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Failed to get user orders',
        });
    }
};

export const deleteUserOrder = async (req, res) => {
    try {
        const userOrder = await OrderedProductModel.findOne({
            user: req.userId,
        });

        if (!userOrder)
            return res.status(404).json({
                message: 'User order not found',
            });

        userOrder.orders = userOrder.orders.filter(
            (item) => !item._id.equals(req.params.orderId)
        );

        if (userOrder.orders.length === 0) {
            await OrderedProductModel.findByIdAndDelete(userOrder._id);
        } else {
            await userOrder.save();
        }

        res.json({
            success: true,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Failed to delete user order',
        });
    }
};

// admin

export const getAllOrders = async (_, res) => {
    try {
        const orders = await OrderedProductModel.find()
            .populate('user')
            .populate('orders.product');

        if (!orders)
            return res.status(404).json({
                message: 'Orders not found',
            });

        res.json(orders);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Failed to get all orders',
        });
    }
};

export const changeStatusReady = async (req, res) => {
    try {
        const userId = req.params.userId;
        const orderId = req.params.orderId;
        const orderedProducts = await OrderedProductModel.findOne({
            user: userId,
        });
        if (!orderedProducts)
            return res.json({
                message: 'Order not found',
            });

        const order = orderedProducts.orders.find((item) =>
            item._id.equals(orderId)
        );

        const now = new Date();
        const end = new Date(Date.now() + 2 * 60 * 60 * 1000);

        order.statusReady = true;
        order.readyTime = now;
        order.endReadyTime = end;

        orderedProducts.save();

        res.json({
            readyTime: now,
            endReadyTime: end,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Failed to change order status',
        });
    }
};

cron.schedule('* * * * * *', async () => {
    // Задача запускается каждую минуту
    try {
        const now = new Date();
        const expiredOrders = await OrderedProductModel.find({
            'orders.endReadyTime': { $lt: now },
        });

        for (const orderedProduct of expiredOrders) {
            orderedProduct.orders = orderedProduct.orders.filter(
                (order) => order.endReadyTime >= now
            );

            if (orderedProduct.orders.length === 0) {
                await OrderedProductModel.findByIdAndDelete(orderedProduct._id);
            } else {
                await orderedProduct.save();
            }
        }
    } catch (error) {
        console.error('Failed to execute task:', error);
    }
});
