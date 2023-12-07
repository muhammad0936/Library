const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const borrowing = new Schema({
    customer: {
        type : Schema.Types.ObjectId,
        ref: 'Customer',
        required: true
    },
    product: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    order: {
        type: Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    borrowingCostPerWeek: {
        type: Number,
        required: true
    },
    lastReturnDate: {
        type: Date,
        required: true
    },
    isReturned: {
        type: Boolean,
        default: false
    }
},{timestamps: true});

module.exports = mongoose.model('Borrowing', borrowing);