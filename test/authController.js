require("dotenv").config({ path: `${__dirname}/../.env` });
const chai = require('chai');
const { expect } = require('chai');
const chaiHttp = require('chai-http'); 
const sinon = require('sinon');
const path = require('path');
const bcrypt = require('bcryptjs');
process.env.MONGO_STRING = process.env.MONGO_TEST_STRING;

const jwt = require('jsonwebtoken');
const Manager = require('../models/manager');
const Customer = require('../models/customer');

const server = require('../app');

chai.use(chaiHttp);

describe('AUTH CONTROLLER : ', function(){
    let adminId;
    before(async function(){
        let admin = await Manager.findOne({email: "manager2@manager.com"});
        if(!admin)
        {
            const hashedPassword = await bcrypt.hash('123456', 12);
            admin = new Manager({
            fname: "fname",
            mname: "mname",
            lname: "lname",
            email: "manager2@manager.com",
            password: hashedPassword,
            idNumber: "123456789543",
            birthDate:"2000-12-31",
            phone: "123456789991",
            address: "addressaddress",
            idPhotoUrl: "images\\1698686497114-IMG_20191103_235223_067.jpg",
            personalPhotoUrl: "images\\1698686497126-IMG_20200306_225435_667.jpg"
          });
        admin = await admin.save();
        }
        adminId = admin._id;
    });
//  ADD MANAGER :
    describe('/addManager', function(){
        it('should throw 422 error if we entered inalid inputs.', function(done){
            const stub1 = sinon.stub(jwt, 'verify').returns(1);

            const fields = {
                fname: "fname",
                mname: "mname",
                lname: "lname",
                email: "manager2@manager.com",
                password: "123456",
                idNumber: "123456789543",
                birthDate:"2000-12-31",
                phone: "123456789991",
                address: "addressaddress",
                idPhotoUrl: "images\\1698686497114-IMG_20191103_235223_067.jpg",
                personalPhotoUrl: "images\\1698686497126-IMG_20200306_225435_667.jpg"
              }
              const request = chai.request(server).post('/manager');
              for(let field in fields)
              {
                request.field(field, fields[field]);
              }
            //   request.attach('images', path.join(__dirname, '../imagesForTest/test1.png'));
            //   request.attach('images', path.join(__dirname, '../imagesForTest/test2.png'));
              request.end((err, res) => {
                expect(res).to.have.status(422);
                stub1.restore();
                done()
              })
        });

    it('should throw 401 error if the user id provided doesn\' match any admin.', function(done){
        const stub1 = sinon.stub(jwt, 'verify').returns(0);
        const fields = {
            fname: "fname",
            mname: "mname",
            lname: "lname",
            email: "manager2@manager.com",
            password: "123456",
            idNumber: "123456789543",
            birthDate:"2000-12-31",
            phone: "123456789991",
            address: "addressaddress",
            idPhotoUrl: "images\\1698686497114-IMG_20191103_235223_067.jpg",
            personalPhotoUrl: "images\\1698686497126-IMG_20200306_225435_667.jpg"
          }
          const request = chai.request(server).post('/manager');
          for(let field in fields)
          {
            request.field(field, fields[field]);
          }
          request.attach('images', path.join(__dirname, '../imagesForTest/test1.png'));
          request.attach('images', path.join(__dirname, '../imagesForTest/test2.png'));
          request.end((err, res) => {
            expect(res).to.have.status(401);
            stub1.restore();
            done();
          });
    });

    it('should return response with 201 status code if we provide valid admin id and fields of the manager.', function(done){
        const stub1 = sinon.stub(jwt, 'verify').returns(1);
        const stub2 = sinon.stub(Manager, 'findOne').resolves(1);

        const fields = {
            fname: "fname",
            mname: "mname",
            lname: "lname",
            email: "manager3@manager.com",
            password: "123456",
            idNumber: "92584739423",
            birthDate:"2000-12-31",
            phone: "523423423423",
            address: "addressaddress",
            idPhotoUrl: "images\\1698686497114-IMG_20191103_235223_067.jpg",
            personalPhotoUrl: "images\\1698686497126-IMG_20200306_225435_667.jpg"
          }
          const request = chai.request(server).post('/manager');
          for(let field in fields)
          {
            request.field(field, fields[field]);
          }
          request.attach('images', path.join(__dirname, '../imagesForTest/test1.png'));
          request.attach('images', path.join(__dirname, '../imagesForTest/test2.png'));
        request.end((err, res)=> {
            expect(res).to.have.status(201);
            stub1.restore();
            stub2.restore();
            Manager.findOneAndDelete({email: 'manager3@manager.com'})
            .then(()=>{
                done();
            })
        });
    });
    });
// SIGNUP :
    describe('/signup', function(){
        it('should throw 422 error if the inputs are invalid.', function(done){
            const stub1 = sinon.stub(jwt, 'verify').returns(1);
            const fields = {
                email: 'customer@test',
                password: '12345',
                name: 'muhammad'
            }
            const request = chai.request(server).post('/signup');
            for(let field in fields)
            {
                request.field(field, fields[field]);
            }
            request.attach('images', path.join(__dirname, '../imagesForTest/test1.png'));
            request.end((err, res)=> {
                expect(res).to.have.status(422);
                stub1.restore();
                done();
            });
        });

        it('should return response with 201 status code if we provide valid customer info.', function(done){
            const stub1 = sinon.stub(jwt, 'verify').returns(1);
            const stub2 = sinon.stub()
            const fields = {
                email: 'customer@test.com',
                password: '12345',
                name: 'muhammad'
            }
            const request = chai.request(server).post('/signup');
            for(let field in fields)
            {
                request.field(field, fields[field]);
            }
            request.attach('images', path.join(__dirname, '../imagesForTest/test1.png'));
            request.end((err, res)=> {
                expect(res).to.have.status(201);
                stub1.restore();
                Customer.findOneAndDelete({email : 'customer@test.com'})
                .then((c)=>{
                    console.log(c)
                    done();
                });
            }); 
        })
    });

 // LOGIN :
    describe('/login', function(){
        it('should throw 422 error if the user info provided are invalid.', function(done){
            const stub1 = sinon.stub(jwt, 'verify').returns(1);
            const request = chai.request(server).get('/login');
            const fields = {
                email: 'manager2@manager',
                password: '123456'
            }
            for(let field in fields){
                request.field(field, fields[field]);
            }
            request.end((err, res) => {
                expect(res).to.have.status(422);
                stub1.restore();
                done();
            });
        });

        it('should throw 401 error if the email doesn\t match any user', function(done){
            const stub1 = sinon.stub(jwt, 'verify').returns(1);

            const request = chai.request(server).get('/login?isManager=true');
            const fields = {
                email: 'manager1@manager.com',
                password: '123456'
            }
            for(let field in fields){
                request.field(field, fields[field]);
            }
            request.end((err, res) => {
                expect(res).to.have.status(401);
                stub1.restore();
                done();
            });
        });

        it('should throw 401 error if the password was incorrect.', function(done){
            const stub1 = sinon.stub(jwt, 'verify').returns(1);

            const request = chai.request(server).get('/login?isManager=true');
            const fields = {
                email: 'manager2@manager.com',
                password: '000000'
            }
            for(let field in fields){
                request.field(field, fields[field]);
            }
            request.end((err, res) => {
                expect(res).to.have.status(401);
                stub1.restore();
                done();
            });
        });

        it('should return response with 200 status code and the jwt token in the header if the email and password are correct', function(done){
            const stub1 = sinon.stub(jwt, 'verify').returns(1);
            
            const request = chai.request(server).get('/login?isManager=true');
            const fields = {
                email: "manager2@manager.com",
                password: '123456'
            }
            for(let field in fields){
                request.field(field, fields[field]);
            }
            request.end((err, res)=>{
                const token = res.get('Authorization').split(' ')[1];
                const returnedEmail = jwt.decode(token).email;
                expect(res).to.have.status(200);
                expect(returnedEmail).to.equals(fields.email);
                stub1.restore();
                done();
            });
        });
    });
 // SEND RESET EMAIL :
    describe('/reset', function(){

        it('should throw 422 error if the user email was invalid', function(done){
            const stub1 = sinon.stub(jwt, 'verify').returns(1);
            
            const request = chai.request(server).get('/reset');
            request.field('email', 'manager@manger');
            request.end((err, res)=> {
                expect(res).to.have.status(422);
                stub1.restore();
                done();
            })
        });

        it('should throw 404 error if the user email was not exist.', function(done){
            const stub1 = sinon.stub(jwt, 'verify').returns(1);
            
            const request = chai.request(server).get('/reset?isManager=true');
            request.field('email', 'manager@manger.com');
            request.end((err, res)=> {
                expect(res).to.have.status(404);
                stub1.restore();
                done();
            })
        });

        it('should return response with 200 status code if the email sent successfully', function(done){
            const stub1 = sinon.stub(jwt, 'verify').returns(1);

            const request = chai.request(server).get('/reset?isManager=true');
            request.field('email', 'manager2@manager.com');
            request.end((err, res)=>{
                expect(res).to.have.status(200);
                stub1.restore();
                done();
            });
        }); 
    });

 // RESET PASSWORD :
    describe('/resetPassword', function(){
        it('should throw 422 error if the user email was invalid', function(done){
            const stub1 = sinon.stub(jwt, 'verify').returns(1);
            
            const request = chai.request(server).put('/resetPassword?isManager=true');
            const fields = {
                email: 'manager2@manager',
                token: '12345',
                password: '123456'
            }
            for(let field in fields)
            {
                request.field(field, fields[field]);
            }
            request.end((err, res)=> {
                expect(res).to.have.status(422);
                stub1.restore();
                done();
            })
        });

        it('should throw 401 error if the user email or token were invalid', function(done){
            const stub1 = sinon.stub(jwt, 'verify').returns(1);
            
            const request = chai.request(server).put('/resetPassword?isManager=true');
            const fields = {
                email: 'manager2@manager.com',
                token: '12345',
                password: '123456'
            }
            for(let field in fields)
            {
                request.field(field, fields[field]);
            }
            request.end((err, res)=> {
                expect(res).to.have.status(401);
                stub1.restore();
                done();
            })
        });

        it('should return response with 201 status code if the email and token were valid.', function(done){
            const stub1 = sinon.stub(jwt, 'verify').returns(1);
            
            const manager = Manager.findOne({email: 'manager2@manager.com'})
            .then(manager=>{
                const token = manager.resetToken;
                const request = chai.request(server).put('/resetPassword?isManager=true');
                const fields = {
                    email: 'manager2@manager.com',
                    token: token,
                    password: '123456'
                }
                for(let field in fields)
                {
                    request.field(field, fields[field]);
                }
                request.end((err, res)=> {
                    expect(res).to.have.status(201);
                    stub1.restore();
                    done();
                });
            });
        });
    });
    
    after(async function(){
        await Manager.findByIdAndDelete(adminId);
    });


});