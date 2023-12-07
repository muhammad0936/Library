const express = require('express');
const router = express.Router();
const isAuth = require('../middleware/isAuth');
const authControllers = require('../controllers/auth');
const { body, check } = require('express-validator');

const addManager = [
    body('fname').isAlpha().isLength({max: 15}).withMessage('Enter first name with maximum 15 chars!'),
    body('mname').isAlpha().isLength({max: 15}).withMessage('Enter middle name with maximum 15 chars!'),
    body('lname').isAlpha().isLength({max: 15}).withMessage('Enter last name with maximum 15 chars!'),
    body('email').isEmail().withMessage('Enter a valid email!'),
    body('password').isString().isLength({ min: 5, max: 20}).trim().withMessage('Enter password with length 5=>20'),
    body('idNumber').isNumeric().isLength(10).withMessage('The ID number must be numeric and with 10 lenght'),
    body('birthDate').isString().withMessage('Enter valid date'),
    body('phone').isNumeric().isLength(10).withMessage('The phone number must be numeric and with 10 lenght'),
    body('address').isString().isLength({ min: 10, max: 40}).withMessage('The address must be with length 10=>40'),
    check('files').custom( async( value, {req}) => {
        if(!req.files[1])
        {
            const error = new Error('Provide two images.');
            throw error;
        }
    })
];

const singup = [
    body('name').isAlpha().isLength({ max: 15 }).withMessage('Enter name with maximum 15 chars'),
    body('email').isEmail().withMessage('Enter a valid email!'),
    body('password').isString().isLength({ min: 5, max: 20}).trim().withMessage('Enter password with length 5=>20'),
    check('files').custom( async( value, {req} ) => {
        if(!req.files[0])
        {
            const error = new Error('Provide an image.');
            error.statusCode = 422;
            throw error;
        }
        if(req.files[1])
        {
            const error = new Error('Provide just one image.');
            error.statusCode = 422;
            throw error;
        }
    })
];

const login = [
    body('email').isEmail().withMessage('Enter a valid email!'),
    body('password').isString().isLength({ min: 5, max: 20}).trim().withMessage('Enter password with length 5=>20')
];

const reset = [
    body('email').isEmail().withMessage('Enter a valid email!')
]

const resetPassword = [
    body('email').isEmail().withMessage('Enter a valid email!'),
    body('token').isNumeric().isLength({ max: 10 }).withMessage('Reset token is invalid!'),
    body('password').isString().isLength({ min: 5, max: 20}).trim().withMessage('Enter password with length 5=>20')
];


router.post('/manager',isAuth, addManager, authControllers.addManamger);

router.post('/signup', singup, authControllers.singup);

router.get('/login', login, authControllers.login);

router.get('/reset', reset, authControllers.sendResetEmail);

router.put('/resetPassword', resetPassword, authControllers.resetPassword);


module.exports = router;