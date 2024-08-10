import bcrypt from 'bcrypt';
import Stripe from 'stripe';

import UserModel from '../models/User.js';
import OrderedProductModel from '../models/OrderedProduct.js';
import { createToken } from '../helpers.js';

export const register = async (req, res) => {
    try {
        const password = req.body.password;
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        const doc = new UserModel({
            email: req.body.email,
            fullName: req.body.fullName,
            passwordHash: hash,
        });

        const user = await doc.save();

        const token = createToken(user._id);

        const { passwordHash, ...userData } = user._doc;

        res.json({
            ...userData,
            token,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Failed to register',
        });
    }
};

export const login = async (req, res) => {
    try {
        const user = await UserModel.findOne({
            email: req.body.email,
        });
        if (!user)
            return res.status(404).json({
                message: 'User not found',
            });

        const isValidPass = await bcrypt.compare(
            req.body.password,
            user._doc.passwordHash
        );
        if (!isValidPass)
            return req.status(400).json({
                message: 'Invalid password or email',
            });

        const token = createToken(user._id);

        const { passwordHash, ...userData } = user._doc;

        res.json({
            ...userData,
            token,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Failed to login',
        });
    }
};

export const getMe = async (req, res) => {
    try {
        const user = await UserModel.findById(req.userId);

        if (!user)
            return res.status(404).json({
                message: 'User not found',
            });

        const { passwordHash, ...userData } = user._doc;

        res.json(userData);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'No access',
        });
    }
};

export const refuel = async (req, res) => {
    try {
        const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

        const {
            stationName,
            litersFilled,
            cost,
            location,
            scores,
            fuelName,
            costPerLiter,
        } = req.body;

        const user = await UserModel.findById(req.userId);

        if (!user) {
            return res.status(404).json({
                message: 'User not found',
            });
        }

        // payments logic

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: fuelName,
                        },
                        unit_amount: Math.round(costPerLiter * 100),
                    },
                    quantity: litersFilled,
                },
            ],
            mode: 'payment',
            success_url: 'http://localhost:3000/refuelHistory',
            cancel_url: 'http://localhost:3000/',
            locale: 'en',
        });

        user.refuelingHistory.push({
            stationName,
            location,
            litersFilled,
            cost,
            fuelName,
        });

        user.scores += scores;

        await user.save();

        res.json({
            sessionId: session.id,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Failed to record information about refueling',
        });
    }
};

// admin

export const getUsers = async (_, res) => {
    try {
        const users = await UserModel.find();
        if (!users)
            return res.status(404).json({
                message: 'User not found',
            });
        res.json(users);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Failed to get users',
        });
    }
};

export const setUserRole = async (req, res) => {
    try {
        const user = await UserModel.findById(req.params.userId);

        if (!user)
            return res.status(401).json({
                message: 'User not found',
            });

        user.role = req.body.role;
        await user.save();

        res.json({
            success: true,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Failed to set role',
        });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const userId = req.params.userId;

        const user = await UserModel.findByIdAndDelete(userId);

        if (!user)
            return res.status(404).json({
                message: 'User not found',
            });

        await OrderedProductModel.findOneAndDelete({
            user: userId,
        });

        res.json({
            message: 'User successfully deleted',
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Failed to delete user',
        });
    }
};
