require("dotenv").config({ path: `${__dirname}/../.env` });
process.env.MONGO_STRING = process.env.MONGO_TEST_STRING;
const chai = require('chai');
const chaiHttp = require('chai-http');
const path = require('path');
const { expect } = require('chai');
const sinon = require('sinon');

const server = require('../app');

const jwt = require('jsonwebtoken');
const Customer = require('../models/customer');
const Product = require('../models/product');
const Order = require('../models/order');

chai.use(chaiHttp);

describe('CUSTOMER CONTROLLER : ', function(){
    let prod;
    let order;
    before(function(done){
        const product = new Product({
            title: 'title',
            price: 55,
            description: 'description',
            borrowingCostPerWeek: 55,
            imagesUrls: ['abc'],
            creator: '653db2d1f50599968878a86c',
            lastEditor: '653db2d1f50599968878a86c'
        });
        product.save().then((product)=>{
            prod = product;
            done();
        });
    });

    //  GET PRODUCTS :
    describe('/', function(){

    it('should return responst with 200 status code and "No products to show!" message if there is no products yet.', function(done){
        const stub1 = sinon.stub(jwt, 'verify').returns(1);
        const stub2 = sinon.stub(Product, 'find').resolves([]);
        
        const request = chai.request(server).get('/');
        request.end((err, res)=>{
            expect(res).to.have.status(200);
            expect(res.body).to.have.property('message', 'No products to show!');
            stub1.restore();
            stub2.restore();
            done()
        })
    });

    it('should return responst with 200 status code and "Products list" message if there is no products yet.', function(done){
        const stub1 = sinon.stub(jwt, 'verify').returns(1);
        const stub2 = sinon.stub(Product, 'find').resolves(['1', '2']);
        
        const request = chai.request(server).get('/');
        request.end((err, res)=>{
            expect(res).to.have.status(200);
            expect(res.body).to.have.property('message', 'Products list');
            stub1.restore();
            stub2.restore();
            done()
        })
    });
        
    });

    //GET PRODUCT :
    describe('/product/:productId', function(){
        it('should throw 401 error if the customer was not found.', function(done){
            const stub1 = sinon.stub(jwt, 'verify').returns(1);
            const stub2 = sinon.stub(Customer, 'findById').resolves(0);

            const request = chai.request(server).get('/product/ABC');
            request.end((err, res)=>{
                expect(res).to.have.status(401);
                stub1.restore();
                stub2.restore();
                done();
            });
        });

        it('should throw 404 error if the product was not found.', function(done){
            const stub1 = sinon.stub(jwt, 'verify').returns(1);
            const stub2 = sinon.stub(Customer, 'findById').resolves(1);
            const stub3 = sinon.stub(Product, 'findById').resolves(0);
            const request = chai.request(server).get('/product/ABC');
            request.end((err, res)=>{
                expect(res).to.have.status(404);
                stub1.restore();
                stub2.restore();
                stub3.restore();
                done();
            });
        });

        it('should return response with 200 status code if the customer id and product id were valid.', function(done){
            const stub1 = sinon.stub(jwt, 'verify').returns(1);
            const stub2 = sinon.stub(Customer, 'findById').resolves(1);
            const stub3 = sinon.stub(Product, 'findById').resolves(1);
            const request = chai.request(server).get('/product/ABC');
            request.end((err, res)=>{
                expect(res).to.have.status(200);
                stub1.restore();
                stub2.restore();
                stub3.restore();
                done();
            });
        });
    });

    // ADD TO CART :   
    describe('/addToCart/:productId', function(){
        it('should throw 401 error if the customer was not found.', function(done){
            const stub1 = sinon.stub(jwt, 'verify').returns(1);
            const stub2 = sinon.stub(Customer, 'findById').resolves(0);

            const request = chai.request(server).post('/cart/ABC');
            request.end((err, res)=>{
                expect(res).to.have.status(401);
                stub1.restore();
                stub2.restore();
                done();
            });
        });

        it('should throw 404 error if the product was not found.', function(done){
            const stub1 = sinon.stub(jwt, 'verify').returns(1);
            const stub2 = sinon.stub(Customer, 'findById').resolves(1);
            const stub3 = sinon.stub(Product, 'findById').resolves(0);
            const request = chai.request(server).post('/cart/ABC');
            request.end((err, res)=>{
                expect(res).to.have.status(404);
                stub1.restore();
                stub2.restore();
                stub3.restore();
                done();
            });
        });

        it('should return response with 201 status code if the product id and customer id were valid.', function(done){
            const stub1 = sinon.stub(jwt, 'verify').returns(1);
            const stub2 = sinon.stub(Customer, 'findById').resolves({cart: [], save: function(){return Promise.resolve(1)}});
            const stub3 = sinon.stub(Product, 'findById').resolves(1);
            const request = chai.request(server).post('/cart/ABC');
            request.end((err, res)=>{
                expect(res).to.have.status(201);
                stub1.restore();
                stub2.restore();
                stub3.restore();
                done();
            });
        });
    });

    //REMOVE FROM CART :
    describe('/removeFromCart/cartProductId', function(){
        it('should throw 401 error if the customer was not found.', function(done){
            const stub1 = sinon.stub(jwt, 'verify').returns(1);
            const stub2 = sinon.stub(Customer, 'findById').resolves(0);

            const request = chai.request(server).delete('/cart/ABC');
            request.end((err, res)=>{
                expect(res).to.have.status(401);
                stub1.restore();
                stub2.restore();
                done();
            });
        });

        it('should return response with 200 status code if the product was already not in the cart.', function(done){
            const stub1 = sinon.stub(jwt, 'verify').returns(1);
            const stub2 = sinon.stub(Customer, 'findById').resolves({cart: [], save: function(){return Promise.resolve(1)}});
            const request = chai.request(server).delete('/cart/ABC');
            request.end((err, res)=>{
                expect(res).to.have.status(200);
                stub1.restore();
                stub2.restore();
                done();
            });
        });

        it('should return response with 201 status code if the product was in the cart.', function(done){
            const stub1 = sinon.stub(jwt, 'verify').returns(1);
            const stub2 = sinon.stub(Customer, 'findById').resolves({cart: [{product: 'ABC'}], save: function(){return Promise.resolve(1)}});
            const request = chai.request(server).delete('/cart/ABC');
            request.end((err, res)=>{
                expect(res).to.have.status(201);
                stub1.restore();
                stub2.restore();
                done();
            });
        });

    });

    //GET CART :
    describe('/getCart', function(){
        it('should throw 401 error if the customer id does\'t match any cutomer.', function(done){
            const stub1=  sinon.stub(jwt, 'verify').returns(1);
            const stub2 = sinon.stub(Customer, 'findById').returns({populate: function(){return Promise.resolve(0)}});

            const request = chai.request(server).get('/cart')
            request.end((err, res)=>{
                expect(res).to.have.status(401);
                stub1.restore();
                stub2.restore();
                done();
            });
        });
        it('should return response with 200 status code and "No products in your cart" message if there is no products to show.', function(done){
            const stub1 = sinon.stub(jwt, 'verify').returns(1);
            const stub2 = sinon.stub(Customer, 'findById').returns({populate: function(){return Promise.resolve({cart: []})}});

            const request = chai.request(server).get('/cart');
            request.end((err, res)=>{
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('message', 'No products in your cart');
                stub1.restore();
                stub2.restore();
                done();
            });
        });
        
        it('should return response with 200 status code and "cart" property which is a non empty array if there are products in the cart.', function(done){
            const stub1 = sinon.stub(jwt, 'verify').returns(1);
            const stub2 = sinon.stub(Customer, 'findById').returns({populate: function(){return Promise.resolve({cart: [1,2]})}});

            const request = chai.request(server).get('/cart');
            request.end((err, res)=>{
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('cart');
                expect(res.body.cart).that.is.an('array').not.empty;
                stub1.restore();
                stub2.restore();
                done();
            });
        });
    });

    //ORDER :
    describe('/order', function(){
        it('should throw 401 error if the customer id does\'t match any cutomer.', function(done){
            const stub1=  sinon.stub(jwt, 'verify').returns(1);
            const stub2 = sinon.stub(Customer, 'findById').resolves(0);

            const request = chai.request(server).post('/order')
            request.end((err, res)=>{
                expect(res).to.have.status(401);
                stub1.restore();
                stub2.restore();
                done();
            });
        });

        it('should throw 404 error if there is no products in the cart.', function(done){
            const stub1=  sinon.stub(jwt, 'verify').returns(1);
            const stub2 = sinon.stub(Customer, 'findById').resolves({cart: []});

            const request = chai.request(server).post('/order')
            request.end((err, res)=>{
                expect(res).to.have.status(404);
                stub1.restore();
                stub2.restore();
                done();
            });
        });

        it('should return response with 201 status code if the customer id was valid and the cart was non empty.', function(done){
            const stub1=  sinon.stub(jwt, 'verify').returns({userId: prod.creator});
            const cartProduct = {
                product : prod._id, 
                price: 1,
                borrowingCostPerWeek: 1, 
                quantity: 1,
                isBorrowed: false,
                borrowingWeeks: 0
            };
            const stub2 = sinon.stub(Customer, 'findById').resolves({cart: [cartProduct], save: function(){return Promise.resolve(1)}});

            const request = chai.request(server).post('/order')
            request.end((err, res)=>{
                expect(res).to.have.status(201);
                order = res.body.order;
                stub1.restore();
                stub2.restore();
                done();
            });
        });
    });

    // GET ORDERS :
    describe('/orders', function(){
        it('should throw 401 error if the customer id does\'t match any cutomer.', function(done){
            const stub1=  sinon.stub(jwt, 'verify').returns(1);
            const stub2 = sinon.stub(Customer, 'findById').resolves(0);

            const request = chai.request(server).get('/orders')
            request.end((err, res)=>{
                expect(res).to.have.status(401);
                stub1.restore();
                stub2.restore();
                done();
            });
        });

        it('should return response with 200 status code and "No orders to show." message if there is no orders to show.', function(done){
            const stub1 = sinon.stub(jwt, 'verify').returns(1);
            const stub2 = sinon.stub(Customer, 'findById').resolves(1);
            const stub3 = sinon.stub(Order, 'find').resolves([]);

            const request = chai.request(server).get('/orders');
            request.end((err, res)=>{
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('message', 'No orders to show.');
                stub1.restore();
                stub2.restore();
                stub3.restore();
                done();
            });
        });

        it('should return response with 200 status code with orders which is non empty array.', function(done){
            const stub1 = sinon.stub(jwt, 'verify').returns(1);
            const stub2 = sinon.stub(Customer, 'findById').resolves(1);
            const stub3 = sinon.stub(Order, 'find').resolves([1,2]);

            const request = chai.request(server).get('/orders');
            request.end((err, res)=>{
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('orders');
                expect(res.body.orders).that.is.an('array').not.empty;
                stub1.restore();
                stub2.restore();
                stub3.restore();
                done();
            });
        });
    });

    // GET INVOICE :
    describe('/order/:orderId', function(){
        it('should throw 404 error if the order id provided doesn\'t match any order.', function(done){
            const stub1 = sinon.stub(jwt, 'verify').returns({userId: prod.creator});
            const stub2 = sinon.stub(Order, 'findById').returns({populate: function(){return Promise.resolve(0)}});

            const request = chai.request(server).get('/order/ABC');
            request.end((err, res)=>{
                expect(res).to.have.status(404);
                stub1.restore();
                stub2.restore();
                done()
            });
        });

        it('should throw 401 error if the user id provided doesn\'t match the order customer.', function(done){
            const stub1 = sinon.stub(jwt, 'verify').returns({userId: prod.creator});
            console.log('order: ', order)
            const stub2 = sinon.stub(Order, 'findById').returns({populate: function(){return Promise.resolve(order)}});

            const request = chai.request(server).get('/order/ABC');
            request.end((err, res)=>{
                expect(res).to.have.status(401);
                stub1.restore();
                stub2.restore();
                done()
            });
        });

        it('should return response with 200 status code and application/pdf content-type.', function(done){
            const stub1 = sinon.stub(jwt, 'verify').returns({userId: order.customer});
            const stub2 = sinon.stub(Order, 'findById').returns({populate: function(){return Promise.resolve(order)}});
            
            const request = chai.request(server).get('/order/ABC');
            request.end((err, res)=>{
                expect(res).to.have.status(200);
                expect(res).have.header('content-type', 'application/pdf');
                stub1.restore();
                stub2.restore();
                done();
            })
        });
    });

    after(function(done){
        done();
    });
});