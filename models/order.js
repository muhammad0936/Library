const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
    products: [
        {
            product: {
              type: Schema.Types.ObjectId,
              ref: 'Product',
              required: true
             },
             price: {
                 type: Number,
                 required: true
             },
             borrowingCostPerWeek: {
                type: Number
             },
             quantity: {
                 type: Number,
                 required: true
             },
             isBorrowed: {
                 type: Boolean,
                 default: false
             },
             borrowingWeeks: {
                 type: Number,
                 default: 1
             }
         }
    ],
    customer: {
       type : Schema.Types.ObjectId,
       required: true,
       ref: 'Customer'
    }
}, {timestamps: true});

module.exports = mongoose.model('Order', orderSchema);