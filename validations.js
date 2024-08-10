import { body } from 'express-validator';

export const loginValidation = [
    body('email', 'Invalid email format').isEmail(),
    body('password', 'The password must be at least 5 characters').isLength({
        min: 5,
    }),
];

export const registerValidation = [
    body('email', 'Invalid email format').isEmail(),
    body('password', 'The password must be at least 5 characters').isLength({
        min: 5,
    }),
    body('fullName', 'The name must be more than 3 characters').isLength({
        min: 3,
    }),
];

export const refuelValidation = [
    body('fuelName', 'The fuel name must be more than 3 characters').isLength({
        min: 5,
    }),
    body('stationName', 'The name must be more than 3 characters').isLength({
        min: 3,
    }),
    body('location', 'The location must be more than 3 characters').isLength({
        min: 3,
    }),
    body(
        'litersFilled',
        'The number of liters must be a number and greater than 0'
    )
        .isNumeric()
        .isFloat({ gt: 0 }),
    body('cost', 'Cost must be a number and greater than 0')
        .isNumeric()
        .isFloat({ gt: 0 }),
    body('scores', 'Scores must be a number and greater than 0')
        .isNumeric()
        .isFloat({ gt: 0 }),
];

export const quantityValidation = [
    body('quantity', 'Quantity must be more than 0')
        .isNumeric()
        .isFloat({ gt: 0 }),
];

export const addProductValidation = [
    body('name', 'The name must be more than 3 characters').isLength({
        min: 3,
    }),
    body('scoresCount', 'Scores count must be more than 0')
        .isNumeric()
        .isFloat({ gt: 0 }),
];
