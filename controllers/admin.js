const Product = require('../models/product');
const Manager = require('../models/manager');
const Sales = require('../models/sales');
const Borrowing = require('../models/borrowing')
const unlink = require('../util/deleteFile');
const IncomingProduct = require('../models/incomingProduct');

const { validationResult } = require('express-validator');
const borrowing = require('../models/borrowing');

// exports.doNothing = function nothing() {return null};

exports.addProduct = async(req, res, next) => {
try{
    // this.doNothing();
    const result = validationResult(req);
    if(!result.isEmpty())
        throw result.array().map(i => {return {...i, statusCode: 422}});
    const manager = await Manager.findById(req.userId);
    if(!manager)
    {
        const error = new Error('Not authorized');
        error.statusCode = 401;
        throw error;
    };
    const title = req.body.title;
    const price = +req.body.price;
    const borrowingCostPerWeek = +req.body.borrowingCostPerWeek;
    const description = req.body.description;

    let imagesUrls = req.files.map(i => {return i.path});
    const product = new Product({
        title: title,
        price: price,
        borrowingCostPerWeek: borrowingCostPerWeek,
        description: description,
        imagesUrls: imagesUrls,
        creator: req.userId,
        lastEditor: req.userId
    });
    const incomingProduct = new IncomingProduct({
        product: product._id,
        title: product.title,
        quantity: +req.body.quantity,
        allQuantityPrice: +req.body.allQuantityPrice
    });
    await incomingProduct.save();
    await product.save();
    res.status(201).json({message: 'Product created successfully.', productId : product._id});
    }catch(err){
    if(!err.statusCode && !err[0])
        err.statusCode = 500;
    if(req.files)
        req.files.map(i => {unlink(i.path)});
    next(err)
    return err;
    }
};

exports.editProduct = async(req, res, next) => {
    try{
        const result = validationResult(req);
        if(!result.isEmpty())
                throw result.array().map(i => {return {...i, statusCode: 422}});
        const productId = req.params.productId;
        const manager = await Manager.findById(req.userId);
        if(!manager)
        {
            const error = new Error('Not authorized');
            error.statusCode = 401;
            throw error;
        }
        const existProduct = await Product.findById(productId);
        if(!existProduct)
        {
            const error = new Error('Product not found!');
            error.statusCode = 404;
            throw error;
        }
        if(req.body.title)
        existProduct.title = req.body.title;
        if(req.body.price)
        existProduct.price = +req.body.price;
        if(req.body.borrowingCostPerWeek)
        existProduct.borrowingCostPerWeek = +req.body.borrowingCostPerWeek;
        if(req.body.description)
        existProduct.description = req.body.description;
        if(req.files && req.files[0])
        {
            existProduct.imagesUrls.map(i => {
                unlink(i)
            })
            existProduct.imagesUrls = req.files.map(i => {if(i)return i.path});
        }
        if(req.userId !== existProduct.lastEditor)
        existProduct.lastEditor = req.userId;
        await existProduct.save();
        res.status(201).json({message: 'Product edited.', productId: existProduct._id});
    }catch(err){
        if(!err.statusCode && !err[0])
            {
                err.statusCode = 500;
                if(req.files)
                    req.files.map(i => {unlink(i.path)});
            }
        next(err);
    }
};

exports.deleteProduct = async(req, res, next) => {
    try{
        const productId = req.params.productId;
        const manager = await Manager.findById(req.userId);
        if(!manager)
        {
            const error = new Error('Not authorized');
            error.statusCode = 401;
            throw error;
        }
        const deletedProduct = await Product.findByIdAndDelete(productId);
        if(!deletedProduct)
        {
            const error = new Error('Product not found!');
            error.statusCode = 404;
            throw error;
        };
        deletedProduct.imagesUrls.map(i => unlink(i));
        res.status(201).json({message: 'Product has deleted.', productId: deletedProduct._id})
    }catch(err){
        if(!err.statusCode && !err[0])
            err.statusCode = 500;
        next(err);
    }
};

exports.getInventoryProducts = async(req, res, next) => {
    try{
        const userId = req.userId;
        const manager = await Manager.findById(userId);
        if(!manager || !manager.isAdmin)
        {
            const error = new Error('Not authorized!');
            error.statusCode = 401;
            throw error;
        }
        const incomingProducts = await IncomingProduct.find();
        if(!incomingProducts[0])
        {
            const error = new Error('No products found!');
            error.statusCode = 404;
            throw error;
        };
        res.status(200).json({incomingProducts: incomingProducts});
    }catch(err)
    {
        if(!err.statusCode && !err[0])
            err.statusCode = 500;
        next(err);
    }
}


exports.deleteProductFromInventory = async(req, res, next) => {
    try{
        const inventoryProductId = req.params.incomingProductId;
        const manager = await Manager.findById(req.userId);
        if(!manager || !manager.isAdmin)
        {
            const error = new Error('Not authorized');
            error.statusCode = 401;
            throw error;
        }
        const inventoryDeletedProduct = await IncomingProduct.findByIdAndDelete(inventoryProductId);
        if(!inventoryDeletedProduct)
        {
            const error = new Error('Product not found!');
            error.statusCode = 404;
            throw error;
        };
        res.status(201).json({message: 'Produlct deleted.', incomingProductId: inventoryDeletedProduct._id})
    }catch(err){
        if(!err.statusCode && !err[0])
        err.statusCode = 500;
        next(err);
    }
};

exports.returnBorrowedProduct = async(req, res, next) => {
    const orderId = req.params.orderId;
    const productId = req.params.productId;
    const userId = req.userId;
    try{
        
        const manager = await Manager.findById(userId);
        console.log(manager)
        if(!manager)
        {
            const error = new Error('Not authorized!');
            error.statusCode = 401;
            throw error;
        }
        const borrowedProduct = await borrowing.findOne({order: orderId, product: productId});
        if(!borrowedProduct)
        {
            const error = new Error('Product not found!');
            error.statusCode = 404;
            throw error;
        }
        console.log(borrowedProduct)
        if(Date.now() < borrowedProduct.lastReturnDate)
        {
            borrowedProduct.isReturned = true;
            await borrowedProduct.save();
            return res.status(201).json({message: 'Product returned.', borrowedProduct: borrowedProduct._id});
        }
        await borrowing.findByIdAndDelete(borrowedProduct._id);
        res.status(200).json({message: 'Returning time has expired, The product has moved to sells, Check the customer fine.'});
    }catch(err){
        if(!err.statusCode && !err[0])
            err.statusCode = 500;
        next(err);
    }
};

exports.getSales = async(req, res, next) => {
    const userId = req.userId;
    try{
        // const admin = await Manager.findById(userId);
        const admin = await Manager.findOne({_id: userId, isAdmin: true});
        if(!admin)
        {
            const error = new Error('Not authorized!');
            error.statusCode = 401;
            throw error;
        }
        const sales = await Sales.find();
        if(!sales[0])
        {
            return res.status(200).json({message: 'No sales to show.'});
        }
        res.status(200).json({message: 'The sales: ', sales: sales});
    }catch(err){
        if(!err.statusCode && !err[0])
            err.statusCode = 500;
        next(err);
    }
};

exports.getBorrowings = async(req, res, next) => {
    const userId = req.userId;
    try{
        const manager = await Manager.findById(userId);
        if(!manager)
        {
            const error = new Error('Not authorized!');
            error.statusCode = 401;
            throw error;
        }
        const borrowings = await Borrowing.find();
        if(!borrowings[0])
        {
            return res.status(200).json({message: 'No borrowings to show.'});
        }
        res.status(200).json({message: 'The borrowings: ', borrowings: borrowings});
    }catch(err){
        if(!err.statusCode && !err[0])
            err.statusCode = 500;
        next(err);
    }
};