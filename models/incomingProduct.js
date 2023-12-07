const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const incomingProduct = new Schema({
                product: {  
                    type: Schema.Types.ObjectId,
                    ref: 'Product',
                    required: true
                },
                title: {
                    type: String,
                    required: true
                },
                quantity: {
                    type: Number,
                    required: true
                },
                allQuantityPrice: {
                    type: Number,
                    required: true
                }
},{timestamps: true});

module.exports = mongoose.model('IncomingProduct', incomingProduct);