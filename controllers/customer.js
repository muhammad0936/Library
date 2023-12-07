const Manager = require('../models/manager');
const Customer = require('../models/customer');
const Product = require('../models/product');
const Order = require('../models/order');
const Sales = require('../models/sales');
const Borrowing = require('../models/borrowing');
const { query, validationResult } = require('express-validator');
const PDFdocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { error } = require('console');


exports.getProducts = async(req, res, next) => {
    try{
        const products = await Product.find();
        if(!products[0])
        {
            return res.status(200).json({message: 'No products to show!', products: []});
        }
        // const x = products.map(i => {
        //     delete i['creator', 'lastEditor', 'createdAt', 'updatedAt'];
        //     return i;
        // });
        res.status(200).json({message: 'Products list', products: products});
        
    }catch(err){
        if(!err.statusCode && !err[0])
        err.statusCode = 500;
    next(err);
    }
};

exports.getProduct = async(req, res, next) => {
    try{
        const customer = await Customer.findById(req.userId);
        if(!customer)
        {
            const error = new Error('Not authorized!');
            error.statusCode = 401;
            throw error;
        };
        const product = await Product.findById(req.params.productId);
        if(!product)
        {
            const error = new Error('Product not found!');
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json({message: 'Product details.', product: product});
    }catch(err){
        if(!err.statusCode && !err[0])
        err.statusCode = 500;
    next(err);
    }
}

exports.addToCart = async(req, res, next) => {
    const productId = req.params.productId;      
    const quantity = req.body.quantity;
    const isBorrowed = (req.body.isBorrowed === 'true')? true : false;
    const borrowingWeeks = (req.body.borrowingWeeks)? Math.floor(+req.body.borrowingWeeks) : 1;
    try{
        const customer = await Customer.findById(req.userId);
        if(!customer)
        {
            const error = new Error('Not authorized!');
            error.statusCode = 401;
            throw error;
        };
        const product = await Product.findById(productId);
        if(!product)
        {
            const err = new Error("Product not found!");
            err.statusCode = 404;
            throw err;
        }
        let isExist = false;
        customer.cart = customer.cart.map(i => {
            if(i.product.toString() === productId && i.isBorrowed === isBorrowed && (!isBorrowed || i.borrowingWeeks === borrowingWeeks))
            {
                i.quantity += +quantity;
                isExist = true;
            }
            return i;
        });
        if(!isExist)
        {
            customer.cart.push({
                product: productId,
                price: product.price,
                borrowingCostPerWeek: product.borrowingCostPerWeek,
                borrowingWeeks: (isBorrowed)?borrowingWeeks : 1,
                quantity: quantity,
                isBorrowed: isBorrowed
            });
        }
        await customer.save();
        res.status(201).json({message: 'Product added to the cart', customerCart: customer.cart})
    }catch(err)
    {
        if(!err.statusCode && !err[0])
        err.statusCode = 500;
    next(err);
    }
};

exports.removeFromCart = async(req, res, next) => {
    const cartProductId = req.params.productId;
    try{
        const customerId = req.userId;
        const customer = await Customer.findById(customerId);
        if(!customer)
        {
            const error = new Error('Not authorized!');
            error.statusCode = 401;
            throw error;
        };
        let isExist = false;
        customer.cart = customer.cart.filter(p => {
            if(p.product.toString() === cartProductId)
            {
                isExist = true;
                return false;
            }
            return true;
        });
        await customer.save();
        if(!isExist)
        {
            res.status(200).json({message: 'This product is already not in the cart!'});
            return;
        }
        res.status(201).json({message: 'Product removed from the cart.'});
    }catch(err){
        if(!err.statusCode && !err[0])
        err.statusCode = 500;
        next(err);
    }
};


exports.getCartItems = async(req, res, next) => {
    const userId = req.userId;
    try{
        const customer = await Customer.findById(userId).populate('cart.product');
        console.log(customer)
        if(!customer)
        {
            const error = new Error('Not authorized!');
            error.statusCode = 401;
            throw error;
        }
        if(!customer.cart[0])
        {
            return res.status(200).json({message: 'No products in your cart', cart: []})
        }
        res.status(200).json({message: 'Your cart items :', cart: customer.cart})
            console.log('No products in the cart')
    }catch(err){
        if(!err.statusCode && !err[0])
            err.statusCode = 500;
        next(err);
    }
}

exports.order = async(req, res, next) => {
    let borrowedProduct, sales;
    try{
        const userId = req.userId;
        const customer = await Customer.findById(userId);
        if(!customer)
        {
            const error = new Error('Not authorized!');
            error.statusCode = 401;
            throw error;
        };
        if(customer.cart.length === 0)
        {
            const error = new Error('No products to order!');
            error.statusCode = 404;
            throw error;
        }
        const order = new Order({
            products: customer.cart,
            customer: userId
        });
        customer.cart = [];
        await customer.save();
        const savedOrder = await order.save();
        for (e of order.products) {
            if(e.isBorrowed)
            {
                let date = new Date();
                date.setDate(date.getDate()+2)
                date.setHours(0);
                date.setMinutes(0);
                date.setSeconds(0);
                date.setMilliseconds(0);
                borrowedProduct = new Borrowing({
                    product: e.product,
                    order: savedOrder._id,
                    quantity: e.quantity,
                    borrowingCostPerWeek: e.price,
                    lastReturnDate: new Date(date.getTime() + e.borrowingWeeks*7*24*60*60*1000),
                    customer: userId
                });
                await borrowedProduct.save();
            }
            else {
                sales = new Sales({
                    product: e.product,
                    order: savedOrder._id,
                    soldPrice: e.price,
                    quantity: e.quantity,
                    customer: userId
                });
                await sales.save();
            }
        };
        res.status(201).json({message : 'Your order is ready', order : savedOrder});
    }catch(err){
        if(!err.statusCode && !err[0])
        err.statusCode = 500;
    next(err);
    }
};


exports.getOrders = async(req, res, next) => {
    const userId = req.userId;
    try{
        const customer = await Customer.findById(userId);
        if(!customer)
        {
            const error = new Error('Not authorized!');
            error.statusCode = 401;
            throw error;
        }
        const orders = await Order.find({customer: userId});
        if(!orders[0])
        {
            return res.status(200).json({message: 'No orders to show.'});
        }
        res.status(200).json({message: 'Your orders: ', orders: orders});
    }catch(err){
        if(!err.statusCode && !err[0])
            err.statusCode = 500;
        next(err);
    }
}


exports.getInvoice = async(req, res, next) => {
    const orderId = req.params.orderId;
    try{
        const order = await Order.findById(orderId).populate('products.product');
        console.log(order)
        console.log(order);
        if(!order)
        {
            const error = new Error('Order not found!');
            error.statusCode = 404;
            throw error;
        };
        if(order.customer.toString() !== req.userId)
        {
            const error = new Error('Not authorized!');
            error.statusCode = 401;
            throw error;
        };
        // pdf document initialisation
        const pdfDoc = new PDFdocument({});
        const invoiceName = 'Invoice_'+orderId+ '.pdf';
        const invoicePath = path.join('data', 'invoices', invoiceName);
        res.status(200)
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-desposition', 'filename = "'+ invoiceName+'"');

        //write on the pdf
        pdfDoc.pipe(fs.createWriteStream(invoicePath));
        pdfDoc.pipe(res);
        pdfDoc.fontSize(25).text('My library\n');
        pdfDoc.fontSize(22).text('Order: '+ orderId+'\n\n'
        +new Date().getFullYear() +'-'
        +(new Date().getMonth()+1)+'-'
        +new Date().getDate()+'\n'
        );
        pdfDoc.fontSize(22).text('Bought: \n');

        let totalPrice = 0;
        for(p of order.products)
        {
            if(!p.isBorrowed)
                {
                    pdfDoc.fontSize(18).text(p.product.title+' : '+ p.price+' * '+p.quantity+ ' = '+ p.price*p.quantity +'\n');
                    totalPrice += p.price*p.quantity;
                }
        };
        pdfDoc.fontSize(22).text('Borrowed: \n');
        for(p of order.products)
        {
            if(p.isBorrowed)
            {
                returnDate = Date.now() + p.borrowingWeeks*7*24*60*60*1000;
                totalPrice += p.price*p.quantity*p.borrowingWeeks;
                //write on the pdf
                pdfDoc.fontSize(18).text(
                p.product.title+' : '+ p.price+' * ' + p.borrowingWeeks + ' * ' +p.quantity+ ' = '+ p.price*p.quantity*p.borrowingWeeks +'\n' + 'Last return date : '
                +new Date( returnDate).getFullYear() +'-'
                +(new Date( returnDate).getMonth()+1)+'-'
                +new Date( returnDate).getDate()+'\n'
                );
            }
        };
        //write on the pdf
        pdfDoc.fontSize(22).text('\nTotal Price : '+ totalPrice);
        pdfDoc.fontSize()
        pdfDoc.end();

    }catch(err)
    {
        if(!err.statusCode && !err[0])
        err.statusCode = 500;
    next(err);
    }
}