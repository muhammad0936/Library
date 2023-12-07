const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const managerSchema = new Schema({
    fname: {
        type: String,
        required: true
    },
    mname: {
        type: String,
        required: true
    },
    lname: {
        type: String,
        required: true
    },
    email : {
        type: String,
        reqiured: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    idNumber: {
        type: String,
        required: true,
        unique: true
    },
    birthDate: {
        type: Date,
        required: true
    },
    phone: {
        type : String,
        required: true,
        unique: true
    },
    address: {
        type: String,
        required: true
    },
    idPhotoUrl: {
        type: String,
        required: true,
        unique: true
    },
    personalPhotoUrl: {
        type: String,
        required: true,
        unique: true
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    resetToken: String,
    resetTokenExpiration: Date
}, { timestamps: true });

module.exports = mongoose.model("Manager", managerSchema);