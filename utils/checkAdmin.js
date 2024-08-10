import UserModel from '../models/User.js';

export default async (req, res, next) => {
    try {
        const user = await UserModel.findById(req.userId);
        if (user.role === 'admin') {
            next();
        } else {
            res.status(403).json({ message: 'Access denied: Admins only' });
        }
    } catch (error) {
        console.log(error);
        res.status(403).json('No access');
    }
};
