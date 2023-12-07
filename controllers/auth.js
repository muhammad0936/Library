const Manager = require('../models/manager');
const Customer = require('../models/customer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query, validationResult } = require('express-validator');
const Nylas = require('nylas');
const unlink = require('../util/deleteFile');

Nylas.config({
    clientId: process.env.NYLAS_CLIENT_ID,
    clientSecret: process.env.NYLAS_CLIENT_SECRET
});

const nylas = Nylas.with(process.env.NYLAS_ACCESS_TOKEN);

exports.addManamger = async(req, res, next) => { 
    try {
    const result = validationResult(req);
        if (!result.isEmpty()) {
            throw result.array().map(i => {return {...i, statusCode: 422}});
        }
    const userId = req.userId;
    const admin = await Manager.findOne({_id: userId, isAdmin: true});
    if(!admin)
    {
        const error = new Error('Not Authorized!');
        error.statusCode = 401;
        throw error;
    };
    const fname = req.body.fname;
    const mname = req.body.mname;
    const lname = req.body.lname;
    const email = req.body.email;
    const password = req.body.password;
    const idNumber = req.body.idNumber;
    const birthDate = new Date(req.body.birthDate);
    const phone = req.body.phone;
    const address = req.body.address;
    const idPhotoUrl = req.files[0].path;
    const personalPhotoUrl = req.files[1].path;
        const hashedPassword = await bcrypt.hash(password, 12);
        const manager = new Manager({
            fname: fname,
            mname: mname,
            lname: lname,
            email: email,
            password: hashedPassword,
            idNumber: idNumber,
            birthDate: birthDate,
            phone: phone,
            address: address,
            idPhotoUrl: idPhotoUrl,
            personalPhotoUrl: personalPhotoUrl
        });
        await manager.save();
        res.status(201).json({message: 'Manager added successfully.'});
    }catch (err){
        if(!err.statusCode && !err[0])
        err.statusCode = 500;
        req.files.map(i => {unlink(i.path)});
        next(err)
    };
    
};

exports.singup = async(req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.name;
    try{
        const result = validationResult(req);
        if (!result.isEmpty()) {
            console.log(result.array())
            throw result.array().map(i => {return {...i, statusCode: 422}});
        }
        const idPhotoUrl = req.files[0].path;
        const hashedPassword = await bcrypt.hash(password, 12);
        const customer = new Customer({
        email: email,
        password: hashedPassword,
        name: name,
        idPhotoUrl: idPhotoUrl,
        cart: []
        });
        const loadedCustomer = await customer.save();
        const token = jwt.sign({
            email: loadedCustomer.email,
            userId: loadedCustomer._id
        },'thisismysecretkey',{expiresIn: '7d'});
        res.status(201).json({message: 'Customer added successfully.', token: token});
        }catch(err){
        if(!err.statusCode && !err[0])
            err.statusCode = 500;
        req.files.map(i => {unlink(i.path)});
        next(err);
    }

}

exports.login = async(req, res, next) => {
    try{
        const result = validationResult(req);
        if (!result.isEmpty()) {
            console.log(result.array())
            throw result.array().map(i => {return {...i, statusCode: 422}});
        }
        const password = req.body.password;
        const loadedUser = (req.query.isManager !== 'true')? await Customer.findOne({email: req.body.email}) : await Manager.findOne({email: req.body.email});

        if(!loadedUser)
        {
            const error = new Error('Email or password is incorrect!');
            error.statusCode = 401;
            throw error;
        };
        const isEqual = await bcrypt.compare(password, loadedUser.password);
        if(!isEqual)
        {
            const error = new Error('Email or password is incorrect!');
            error.statusCode = 401;
            throw error
        };
        const token = jwt.sign(
            {
                email: loadedUser.email,
                userId: loadedUser._id
            },'thisismysecretkey',{expiresIn: '1d'}
        );
        res.header('Authorization', `Bearer ${token}`);
        res.status(200).json({message: 'signed in successfully.'});
    }catch(error){
        if(!error.statusCode && !error[0])
            error.statusCode = 500;
    next(error);
    }
};

exports.sendResetEmail = async(req, res, next) => {
    try{
        const result = validationResult(req);
        if (!result.isEmpty()) {
            console.log(result.array())
            throw result.array().map(i => {return {...i, statusCode: 422}});
        }
        const user = (req.query.isManager !== 'true')? await Customer.findOne({email: req.body.email}) : await Manager.findOne({email: req.body.email});
        if(!user)
        {
            const error = new Error('This email not found!');
            error.statusCode = 404;
            throw error;
        };
        const token = Math.floor(Math.random()*10000000000);
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        await user.save();
        const draft = nylas.drafts.build({
            subject: 'Node.js Library',
            body: `Your token is : ${user.resetToken}, use it to reset your ${(req.query.isManager !== 'true')?'customer':'manager'} account password.`,
            to: [{name: user.name, email : user.email}],
        });
        const sentDraft = await draft.send();
        if(!sentDraft)
        {
            const error = new Error('email sending failed!');
            error.statusCode = 500;
            throw error;
        }
        return res.status(200).json({message: 'email sent to the user', email: user.email});
    }catch(err){
        if(!err.statusCode && !err[0])
        err.statusCode = 500;
    next(err);
    }   
};

exports.resetPassword = async(req, res, next) => {

    try{
        const result = validationResult(req);
        if (!result.isEmpty()) {
            console.log(result.array())
            throw result.array().map(i => {return {...i, statusCode: 422}});
        }
        const email = req.body.email;
        const token = req.body.token;
        const password = req.body.password;
        
        const user = (req.query.isManager !== 'true')?
        await Customer.findOne({email : email, resetToken: token, resetTokenExpiration: {$gt: Date.now()}}):
        await Manager.findOne({email : email, resetToken: token, resetTokenExpiration: {$gt: Date.now()}})

        if(!user)
        {
            const error = new Error('Email or token is invalid!');
            error.statusCode = 401;
            throw error;
        };
        const hashedPassword = await bcrypt.hash(password, 12);
        user.password = hashedPassword;
        user.resetToken = null;
        user.resetTokenExpiration = null;
        await user.save();
        const draft = nylas.drafts.build({
            subject: 'Node js Library',
            body: 'Your password has updated.',
            to: [{name: user.name, email: user.email}]
        });
        await draft.send();
        res.status(201).json({message: 'Password updated.'});
    }catch(err){
        if(!err.statusCode && !err[0])
        err.statusCode = 500;
    next(err);
    }
}