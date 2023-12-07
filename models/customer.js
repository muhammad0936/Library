const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const customerSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true  
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    idPhotoUrl: {
        type: String,
        required: true
    },
    resetToken: String,
    resetTokenExpiration: Date,
    cart: [
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
    fine: {
        type: Number,
        default: 0
    } 
}, {timestamps: true});

module.exports = mongoose.model('Customer', customerSchema);