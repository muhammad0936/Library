const mongoose = require('mongoose');
const Product = require('./product');
const Schema = mongoose.Schema;

const sales = new Schema({
    product: {  
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    order: {
        type: Schema.Types.ObjectId,
        ref: 'Order',
        requried: true
    },
    soldPrice: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    customer: {   
        type: Schema.Types.ObjectId,
        ref: 'Customer',
        required: true
    }
},{timestamps: true});

module.exports = mongoose.model('Sales', sales);