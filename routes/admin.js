const express = require('express');
const router = express.Router();
const { body, check, param} = require('express-validator');

const isAuth = require('../middleware/isAuth');
const adminControllers = require('../controllers/admin');


const { Error } = require('mongoose');

// VALIDATORS :
const addProduct = [
    check('files').custom(async(value, {req}) => {
        if(!req.files[0])
        {
            const error = new Error('provide one image at least!');
            error.statusCode = 422;
            throw error;
        };
    }),
    body('title').isLength({min: 5, max: 50}).withMessage('The length must be from 5 to 50 chars!'),
    body('description').isLength({min: 15, max: 150}).withMessage('The length must be from 5 to 50 chars!'),
    body(['title', 'description']).custom(async(value, {req}) => {
        if(!value.match(/^[a-z0-9\s]+$/i))
        {
            const error = new Error('Use only text and numbers with white spaces');
            error.statusCode = 422;
            throw error;
        } 
    }),
    body(['price','borrowingCostPerWeek','quantity', 'allQuantityPrice']).isNumeric().withMessage('Use only numbers!')

];

const editProduct = [
    check('files').optional().custom(async(value, {req}) => {
        if(!req.files[0])
        {
            const error = new Error('provide one image at least!');
            error.statusCode = 422;
            throw error;
        };
    }),
    body('title').optional().isLength({min: 5, max: 50}).withMessage('The length must be from 5 to 50 chars!'),
    body('description').optional().isLength({min: 15, max: 150}).withMessage('The length must be from 5 to 50 chars!'),
    body(['title', 'description']).optional().custom(async(value, {req}) => {
        if(!value.match(/^[a-z0-9\s]+$/i))
        {
            const error = new Error('Use only text and numbers with white spaces');
            error.statusCode = 422;
            throw error;
        } 
    }),
    body(['price','borrowingCostPerWeek','quantity', 'allQuantityPrice']).optional().isNumeric().withMessage('Use only numbers!')

];

//ROUTES :
router.post('/product',isAuth, addProduct, adminControllers.addProduct);

router.put('/product/:productId',isAuth, editProduct, adminControllers.editProduct);

router.delete('/product/:productId',isAuth, adminControllers.deleteProduct);

router.delete('/incomingProduct/:incomingProductId',isAuth, adminControllers.deleteProductFromInventory);

router.post('/returnBorrowed/:orderId/:productId', isAuth,adminControllers.returnBorrowedProduct);

router.get('/inventoryProducts',isAuth,  adminControllers.getInventoryProducts);

router.get('/sales', isAuth, adminControllers.getSales);

router.get('/borrowings', isAuth, adminControllers.getBorrowings);





module.exports = router;