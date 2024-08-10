import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';

import {
    loginValidation,
    refuelValidation,
    registerValidation,
    quantityValidation,
    addProductValidation,
} from './validations.js';

import {
    MachineController,
    OrderedProductController,
    ProductController,
    ShowerController,
    UserController,
    FuelController,
} from './controllers/index.js';

import {
    checkAdmin,
    checkAuth,
    handleValidationErrors,
} from './utils/index.js';

dotenv.config();

mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('DB OK');
    })
    .catch((err) => console.log('DB error', err));

const app = express();

app.use(express.json());
app.use(cors());

app.post(
    '/auth/register',
    registerValidation,
    handleValidationErrors,
    UserController.register
);
app.post(
    '/auth/login',
    loginValidation,
    handleValidationErrors,
    UserController.login
);
app.get('/auth/me', checkAuth, UserController.getMe);

app.get('/users', checkAuth, checkAdmin, UserController.getUsers);
app.post(
    '/refuel',
    checkAuth,
    refuelValidation,
    handleValidationErrors,
    UserController.refuel
);
app.post(
    '/users/:userId/setRole',
    checkAuth,
    checkAdmin,
    UserController.setUserRole
);
app.delete('/users/:userId', checkAuth, checkAdmin, UserController.deleteUser);

app.get('/fuels', FuelController.getFuels);
app.post('/fuels/add', checkAuth, checkAdmin, FuelController.addFuel);
app.delete('/fuels/:fuelId', checkAuth, checkAdmin, FuelController.deleteFuel);

app.get('/machines', MachineController.getMachines);
app.get('/machines/:machineId/book', checkAuth, MachineController.bookMachine);
app.get(
    '/machines/:machineId/release',
    checkAuth,
    MachineController.releaseMachine
);
app.post(
    '/machines/add',
    checkAuth,
    checkAdmin,
    quantityValidation,
    handleValidationErrors,
    MachineController.addMachine
);
app.delete(
    '/machines/:machineId',
    checkAuth,
    checkAdmin,
    MachineController.deleteMachine
);
app.put(
    '/machines/price/update',
    checkAuth,
    checkAdmin,
    MachineController.updateMachinePrice
);

app.get('/showers', ShowerController.getShowers);
app.get('/showers/:showerId/book', checkAuth, ShowerController.bookShower);
app.get(
    '/showers/:showerId/release',
    checkAuth,
    ShowerController.releaseShower
);
app.post(
    '/showers/add',
    checkAuth,
    checkAdmin,
    quantityValidation,
    handleValidationErrors,
    ShowerController.addShower
);
app.delete(
    '/showers/:showerId',
    checkAuth,
    checkAdmin,
    ShowerController.deleteShower
);
app.put(
    '/showers/price/update',
    checkAuth,
    checkAdmin,
    ShowerController.updateShowerPrice
);

app.get('/products/:filterType', ProductController.getProducts);
app.post(
    '/products/:productId/order',
    checkAuth,
    quantityValidation,
    handleValidationErrors,
    OrderedProductController.orderProduct
);
app.post(
    '/products/add',
    checkAuth,
    checkAdmin,
    addProductValidation,
    handleValidationErrors,
    ProductController.addProduct
);
app.delete(
    '/products/:productId',
    checkAuth,
    checkAdmin,
    ProductController.deleteProduct
);

app.get(
    '/userOrders/:userId',
    checkAuth,
    OrderedProductController.getUserOrders
);
app.delete(
    '/userOrders/:orderId',
    checkAuth,
    OrderedProductController.deleteUserOrder
);
app.get(
    '/orders',
    checkAuth,
    checkAdmin,
    OrderedProductController.getAllOrders
);
app.put(
    '/orders/:userId/:orderId/changeStatusReady',
    checkAuth,
    checkAdmin,
    OrderedProductController.changeStatusReady
);

app.listen(process.env.PORT, (err) => {
    if (err) return console.log(err);

    console.log('Server OK');
});
