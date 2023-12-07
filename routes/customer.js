const express = require('express');
const router = express.Router();
const customerControllers = require('../controllers/customer');
const isAuth = require('../middleware/isAuth');


router.get('/', isAuth, customerControllers.getProducts);

router.get('/product/:productId', isAuth, customerControllers.getProduct);

router.post('/cart/:productId', isAuth, customerControllers.addToCart);

router.delete('/cart/:productId', isAuth, customerControllers.removeFromCart);

router.get('/cart', isAuth, customerControllers.getCartItems);

router.post('/order', isAuth, customerControllers.order);

router.get('/orders', isAuth, customerControllers.getOrders);

router.get('/order/:orderId', isAuth, customerControllers.getInvoice);

module.exports = router;