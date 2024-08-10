import cron from 'node-cron';

import UserModel from '../models/User.js';
import ShowerModel from '../models/Shower.js';
import SettingsModel from '../models/Settings.js';

export const getShowers = async (req, res) => {
    try {
        const showers = await ShowerModel.find().populate('occupied.user');

        if (!showers)
            return res.status(404).json({
                message: 'Showers not found',
            });

        const settings = await SettingsModel.findOne();

        if (!settings)
            return res.status(404).json({
                message: 'Settings not found',
            });

        res.json({
            showers,
            price: settings.showerPrice,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Failed to get showers',
        });
    }
};

export const bookShower = async (req, res) => {
    try {
        const userId = req.userId;

        const user = await UserModel.findById(userId);

        if (!user) return res.status(404).json({ message: 'User not found' });

        const shower = await ShowerModel.findById(req.params.showerId);

        if (!shower)
            return res.status(404).json({
                message: 'Shower not found',
            });
        if (shower.occupied.user)
            return res.status(400).json({
                message: `Shower is already occupied by user`,
            });

        const settings = await SettingsModel.findOne();

        if (user.scores >= settings.showerPrice) {
            const bookedAt = new Date();
            const bookedUntil = new Date(
                bookedAt.getTime() + 12 * 60 * 60 * 1000
            ); // 12 часов

            shower.occupied = {
                user: userId,
                bookedAt,
                bookedUntil,
            };

            await shower.save();

            user.scores -= settings.showerPrice;
            await user.save();
        } else {
            return res
                .status(400)
                .json({ message: "You don't have enough points" });
        }
        res.json({
            message: `Shower booked successfully and you spent ${settings.showerPrice} points`,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Failed to get shower',
        });
    }
};

cron.schedule('* * * * * *', async () => {
    // Задача запускается каждую минуту
    try {
        const now = new Date();
        const showers = await ShowerModel.find({
            'occupied.bookedUntil': { $lte: now },
        });

        for (const shower of showers) {
            shower.occupied = {
                user: null,
                bookedAt: null,
                bookedUntil: null,
            };
            await shower.save();
        }
    } catch (error) {
        console.error('Failed to execute task:', error);
    }
});

export const releaseShower = async (req, res) => {
    try {
        const shower = await ShowerModel.findById(req.params.showerId);

        if (!shower)
            return res.status(404).json({
                message: 'shower not found',
            });

        shower.occupied = {
            user: null,
            bookedAt: null,
            bookedUntil: null,
        };

        await shower.save();

        res.json({
            message: 'Shower released successfully',
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Failed to release shower',
        });
    }
};

// admin

export const deleteShower = async (req, res) => {
    try {
        const shower = await ShowerModel.findByIdAndDelete(req.params.showerId);
        if (!shower)
            return res.status(404).json({
                message: 'Shower not found',
            });
        res.json({
            success: true,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Failed to delete shower',
        });
    }
};

export const addShower = async (req, res) => {
    try {
        const newShowers = [];
        for (let i = 1; i <= req.body.quantity; i++) {
            const newShower = new ShowerModel();
            await newShower.save();
            newShowers.push(newShower);
        }

        const settings = await SettingsModel.findOne();
        if (!settings) {
            const showerSettings = new SettingsModel();
            showerSettings.save();
        }

        res.json({
            showers: newShowers,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Failed to add shower',
        });
    }
};

export const updateShowerPrice = async (req, res) => {
    try {
        const { price } = req.body;
        const settings = await SettingsModel.findOne();

        if (!settings)
            return res.status(404).json({
                message: 'Settings not found',
            });

        settings.showerPrice = price;
        settings.save();

        res.json({ message: 'The price successfully updated' });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Failed to get shower price',
        });
    }
};
