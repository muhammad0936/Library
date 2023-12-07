const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    borrowingCostPerWeek: {
        type: Number
    },
    imagesUrls: [{
        type: String,
        required: true
    }],
    creator: {
        type: Schema.Types.ObjectId,
        ref: 'Manager',
        requried: true
    },
    lastEditor: {
        type: Schema.Types.ObjectId,
        ref: 'Manager',
        requried: true
    }
}, {timestamps: true});


module.exports = mongoose.model('Product', productSchema);