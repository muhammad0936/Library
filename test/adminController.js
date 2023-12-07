require("dotenv").config({ path: `${__dirname}/../.env` });
const sinon = require('sinon');
const expect = require('chai').expect;
const chai = require('chai');
const chaiHttp = require('chai-http');
process.env.MONGO_STRING = process.env.MONGO_TEST_STRING;
const server = require('../app');
const path = require('path');


const Manager = require('../models/manager');
const Product = require('../models/product');
const IncomingProducts = require('../models/incomingProduct');
const Borrowing = require('../models/borrowing');
const Sales = require('../models/sales');
const jwt = require('jsonwebtoken');

chai.use(chaiHttp);

const adminController = require('../controllers/admin');
describe('ADMIN CONTROLLER', function(){
  let managerId, productId;
  before(function(done) {
        Manager.findOne({email: 'manager2@manager.com'})
        .then(existManager => {
        if(!existManager)
        {
        const manager = new Manager({
        fname: "fbjkhdrf",
        mname: "mname",
        lname: "lname",
        email: "manager2@manager.com",
        password: "$2a$12$kFkP1rSTpSWiQ.9lkRGRm.qMjQ0CAz7.GUYJniqfNrj2YUtlywsTC",
        idNumber: "123456789543",
        birthDate:"2000-12-31",
        phone: "123456789991",
        address: "addressaddress",
        idPhotoUrl: "images\\1698686497114-IMG_20191103_235223_067.jpg",
        personalPhotoUrl: "images\\1698686497126-IMG_20200306_225435_667.jpg"
      });
       manager.save()
      .then((result) => {
        managerId = result._id;
        const product = new Product({
          title: 'this is product for testing.',
          price: 11,
          description: 'this is dummy description',
          creator: managerId,
          borrowingCostPerWeek: 24,
          imagesUrls: [
          "images\\1699728108268-test1.png"
          ],
          lastEditor: managerId
        });
        return product.save();
      }).then(product => {
        productId = product._id;
        done();
      })
    }else {
      managerId = existManager._id;
      done();
    }
  })
  });
// TEST ADD PRODUCT RUOTE :
  describe('/addProduct', function(){

    it('should throw "Not authorized!" error if the userId dosn\'t match any manager id when we add a new product'
    , function(done){
      const req = {
        userId: null
      }
      adminController.addProduct(req, {}, ()=>{}).then(result => {
        expect(result).to.be.an('error', 'Not authorized')
        done();
      })
    });

    it('should return response with 201 status code if we sent a addProduct request with valid data',
      function(done){
        const stub1 = sinon.stub(jwt, 'verify');
        stub1.returns(1);
        const stub2 = sinon.stub(Manager, 'findById');
        stub2.resolves(1)
        const fields = {
          title: 'this is test title',
          description: 'this is test description',
          price: 55,
          borrowingCostPerWeek:  55,
          quantity:  55,
          allQuantityPrice:  55
        }
        let request = chai.request(server).post('/product');
        for( let field in fields)
        {
          request.field(field, fields[field]);
        }
        request
        .attach('images', path.join(__dirname, '../imagesForTest/test1.png'))
        .end((err, res) => {
          expect(res).to.have.status(201);
          expect(res.body).to.have.property('message', 'Product created successfully.');
          stub1.restore();
          stub2.restore();
          console.log(`**********************${res.body.productId}***********`)
          Product.findByIdAndDelete(res.body.productId).then(() => {
            done();
          });
        });
    });
    
    it('should return response with 422 status code if we sent a addProduct request with invalid data',
    function(done){
      const stub1 = sinon.stub(jwt, 'verify');
      stub1.returns(1);
      const fields = {
        title: 'b',
        description: 'this is test description',
        price: 55,
        borrowingCostPerWeek:  55,
        quantity:  55,
        allQuantityPrice:  55
      }
      let request = chai.request(server).post('/product');
      for( let field in fields)
      {
        request.field(field, fields[field]);
      }
      request
      .attach('images', path.join(__dirname, '../imagesForTest/test1.png'))
      .end((err, res) => {
        expect(res).to.have.status(422);
        stub1.restore();
        done();
      });
  });


    it('should return an error with 500 statusCode if an error without statusCode thrown with addProduct.',
    function(done){
      const stub1 = sinon.stub(jwt, 'verify');
      stub1.returns(1);
      const stub2 = sinon.stub(Manager, 'findById');
      stub2.throws(new Error('thrown by sinon'))
      const fields = {
        title: 'this is title for test',
        description: 'this is test description',
        price: 55,
        borrowingCostPerWeek:  55,
        quantity:  55,
        allQuantityPrice:  55
      }
      let request = chai.request(server).post('/product');
      for( let field in fields)
      {
        request.field(field, fields[field]);
      }
      request
      .attach('images', path.join(__dirname, '../imagesForTest/test1.png'))
      .end((err, res) => {
        expect(res).to.have.status(500);
        stub1.restore();
        stub2.restore();
        done();
      });
    });
    
  })
// TEST EDIT PRODUCT ROUTE :
  describe('/editProduct', function(){
    it('should return a response with 422 statusCode if it got invalid input',function(done){
      const stub1 = sinon.stub(jwt, 'verify').returns(1);
      const request = chai.request(server).put('/product/XYZ');
      const fields = {
        title: 'this is new title.',
        price: 'a'
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

    })
//*
  it('should throw 401 error if no manager matches the userId we provided.', function(done){
    const stub1 = sinon.stub(jwt, 'verify').returns(1);
    const stub2 = sinon.stub(Manager, 'findById').resolves(0);
    const request = chai.request(server).put('/product/XYZ');
    const fields = {
      title: 'this is valid title',
      price: 66
    }
    for(let field in fields)
    {
      request.field(field, fields[field]);
    }
    request.end((err, res)=> {
      expect(res).to.have.status(401);
      stub1.restore();
      stub2.restore();
      done();
    })
  });


  it('should throw 404 error if no product matches the productId we provided.', function(done){
    const stub1 = sinon.stub(jwt, 'verify').returns(1);
    const stub2 = sinon.stub(Manager, 'findById').resolves(1);
    const stub3 = sinon.stub(Product, 'findById').resolves(0);
    const request = chai.request(server).put('/product/XYZ');
    const fields = {
      title: 'this is valid title',
      price: 66
    }
    for(let field in fields)
    {
      request.field(field, fields[field]);
    }
    request.end((err, res)=> {
      expect(res).to.have.status(404);
      stub1.restore();
      stub2.restore();
      stub3.restore();
      done();
    })
  });

  it('should return a response with 201 status code if we sent valid fields', function(done){
    const stub1 = sinon.stub(jwt, 'verify').returns(1);
    const stub2 = sinon.stub(Manager, 'findById').resolves(1);
    // const stub3 = sinon.stub(Product, 'findById');
    
    const request = chai.request(server).put('/product/'+productId);
    const fields = {
      title: 'new title',
      price: 77
    }
    for(let field in fields)
    {
      request.field(field, fields[field]);
    }
    request.end((err, res)=> {
      expect(res).to.have.status(201);
      stub1.restore();
      stub2.restore();
      done();
    })
  });

});
// DELETE PRODUCT :
describe('/deleteProduct', function(){
  it('should throw 401 error if the userId we provide doesnt mach any manager.', function(done){
    const stub1 = sinon.stub(jwt, 'verify').returns(1);
    const stub2 = sinon.stub(Manager, 'findById').resolves(0);
    
    const request = chai.request(server).delete('/product/XYZ');
    request.end((err, res)=> {
      expect(res).to.have.status(401);
      stub1.restore();
      stub2.restore();
      done();
    })
  })

it('should throw 404 error if the product id we provide doesnt match any product', function(done){
  const stub1 = sinon.stub(jwt, 'verify').returns(1);
  const stub2 = sinon.stub(Manager, 'findById').resolves(1);
  const stub3 = sinon.stub(Product, 'findByIdAndDelete').resolves(0);

  const request = chai.request(server).delete('/product/XYZ');
  request.end((err, res) => {
    expect(res).to.have.status(404);
    stub1.restore();
    stub2.restore();
    stub3.restore();
    done()
  });
});
  it('should return a response with 201 status code if the productId provided matches a product.',
  function(done){
    const stub1 = sinon.stub(jwt, 'verify').returns(1);
    const stub2 = sinon.stub(Manager, 'findById').resolves(1);
    const stub3 = sinon.stub(Product, 'findByIdAndDelete').callsFake(Product.findById);
    
    const request = chai.request(server).delete('/product/' + productId);
    request.end((err, res)=> {
      expect(res).to.have.status(201);
      expect(res.body).to.have.property('productId', productId.toString());
      stub1.restore();
      stub2.restore();
      stub3.restore();
      done();
    })
  });
});

// TEST GET INVENTORY PRODCUTS ROUTE :

describe('/getInventoryProducts', function(){

  it('it should throw 401 error if the email we provided doesnt matche any admin', function(done){
    const stub1 = sinon.stub(jwt, 'verify').returns(1);
    const stub2 = sinon.stub(Manager, 'findById').resolves(0);

    const request = chai.request(server).get('/inventoryProducts');
    request.end((err, res)=> {
      expect(res).to.have.status(401);
      stub1.restore();
      stub2.restore();
      done()
    })
  });

  it('it should throw 404 error if the productId we provided doesnt matche any product.', function(done){
    const stub1 = sinon.stub(jwt, 'verify').returns(1);
    const stub2 = sinon.stub(Manager, 'findById').resolves({isAdmin: true});
    const stub3 = sinon.stub(IncomingProducts, 'find').resolves(0);

    const request = chai.request(server).get('/inventoryProducts');
    request.end((err, res)=> {
      expect(res).to.have.status(404);
      stub1.restore();
      stub2.restore();
      stub3.restore();
      done()
    })
  });

  it('should return response with 200 status code if admin id and product id are valid.', function(done){
    const stub1 = sinon.stub(jwt, 'verify').returns(1);
    const stub2 = sinon.stub(Manager, 'findById').resolves({isAdmin: true});

    const request = chai.request(server).get('/inventoryProducts');
    request.end((err, res)=> {
      expect(res).to.have.status(200);
      stub1.restore();
      stub2.restore();
      done();
    });

  });
});

// DELETE PRODUCT FROM INVENTORY :
describe('/deleteincomingProduct', function(){

  it('should throw 401 error if the userId provided doesn\'t matche any admin.', function(done){
    const stub1 = sinon.stub(jwt, 'verify').returns(1);
    const stub2 = sinon.stub(Manager, 'findById').resolves(0);

    const request = chai.request(server).delete('/incomingProduct/XYZ');
    request.end((err, res)=> {
      expect(res).to.have.status(401);
      stub1.restore();
      stub2.restore();
      done();
    })
  });

  it('should throw 404 error if the productId provided doesn\'t matche any product.', function(done){
    const stub1 = sinon.stub(jwt, 'verify').returns(1);
    const stub2 = sinon.stub(Manager, 'findById').resolves({isAdmin: true});
    const stub3 = sinon.stub(IncomingProducts, 'findByIdAndDelete').resolves(0);

    const request = chai.request(server).delete('/incomingProduct/XYZ');
    request.end((err, res)=> {
      expect(res).to.have.status(404);
      stub1.restore();
      stub2.restore();
      stub3.restore();
      done();
    });
  });

  it('should return response with status 201 if the product id and the admin id are valid.', function(done){
    const stub1 = sinon.stub(jwt, 'verify').returns(1);
    const stub2 = sinon.stub(Manager, 'findById').resolves({isAdmin: 1});
    const stub3 = sinon.stub(IncomingProducts, 'findByIdAndDelete').resolves(1);

    const request = chai.request(server).delete('/incomingProduct/XYZ');
    request.end((err, res)=> {
      expect(res).to.have.status(201);
      stub1.restore();
      stub2.restore();
      stub3.restore();
      done();
    });
  });

});

//RETURN BORROWED PRODUCT FROM THE CUSTOMER :

describe('/returnBorrowed', function(){
  
  it('should throw 401 error if the userId provided doesn\'t matche any Manager', function(done){
    const stub1 = sinon.stub(jwt, 'verify').returns(1);
    const stub2 = sinon.stub(Manager, 'findById').resolves(0);

    const request = chai.request(server).post('/returnBorrowed/XYZ/ABC');
    request.end((err, res) => {
      expect(res).to.have.status(401);
      stub1.restore();
      stub2.restore();
      done();
    });
  });

  it('should throw 404 error if the order id and the porduct id don\'y matche any borrowed product.', function(done){
    const stub1 = sinon.stub(jwt, 'verify').returns(1);
    const stub2 = sinon.stub(Manager, 'findById').resolves(1);
    const stub3 = sinon.stub(Borrowing, 'findOne').resolves(0);
    const request = chai.request(server).post('/returnBorrowed/XYZ/ABC');
    request.end((err, res) => {
      expect(res).to.have.status(404);
      stub1.restore();
      stub2.restore();
      stub3.restore();
      done();
    });
  });

  it('should return 201 response if the order id and the porduct id  matches a borrowed product.', function(done){
    const stub1 = sinon.stub(jwt, 'verify').returns(1);
    const stub2 = sinon.stub(Manager, 'findById').resolves(1);
    const stub3 = sinon.stub(Borrowing, 'findOne').resolves(
      {
        _id: 'xyz',
        lastReturnDate: Date.now()+100000,
        save: function(){return Promise.resolve(this)}
      }
      );
    const request = chai.request(server).post('/returnBorrowed/XYZ/ABC');
    request.end((err, res) => {
      expect(res).to.have.status(201);
      stub1.restore();
      stub2.restore();
      stub3.restore();
      done();
    });
  });

  it('should return 200 response if the order id and the porduct id  matches a borrowed product which moved to sells.', function(done){
    const stub1 = sinon.stub(jwt, 'verify').returns(1);
    const stub2 = sinon.stub(Manager, 'findById').resolves(1);
    const findOneResult = {
      _id: 'wxyz',
      lastReturnDate: Date.now()-100000,
      save: function(){
        return Promise.resolve(this);
      }
    }
    const stub3 = sinon.stub(Borrowing, 'findOne').resolves(findOneResult);
    const stub4 = sinon.stub(Borrowing, 'findByIdAndDelete').resolves(1);
    const request = chai.request(server).post('/returnBorrowed/XYZ/ABC');
    request.end((err, res) => {
      expect(res).to.have.status(200);
      stub1.restore();
      stub2.restore();
      stub3.restore();
      stub4.restore();
      done();
    });
  });

});

// GET SALES :
describe('/sales', function(){
  it('should thorw 401 error if the admin id provided doesn\'t match any admin', function(done){
    const stub1 = sinon.stub(jwt, 'verify').returns(1);
    const stub2 = sinon.stub(Manager, 'findOne').resolves(0);
    
    const request = chai.request(server).get('/sales');
    request.end((err, res)=> {
      expect(res).to.have.status(401);
      stub1.restore();
      stub2.restore();
      done();
    });
  });

  it('should return response with 200 status code with "No sales to show." message if no sales exist.', function(done){
    const stub1 = sinon.stub(jwt, 'verify').returns(1);
    const stub2 = sinon.stub(Manager, 'findOne').resolves(1);
    const stub3 = sinon.stub(Sales, 'find').resolves([]);

    const request = chai.request(server).get('/sales');
    request.end((err, res)=> {
      expect(res).to.have.status(200);
      expect(res.body).to.have.property('message', 'No sales to show.');
      stub1.restore();
      stub2.restore();
      stub3.restore();
      done();
    });
  });

  it('should return response with 200 status code with "The sales: " message and array of sales if sales are exist.', function(done){
    const stub1 = sinon.stub(jwt, 'verify').returns(1);
    const stub2 = sinon.stub(Manager, 'findOne').resolves(1);
    const stub3 = sinon.stub(Sales, 'find').resolves(['1', '2']);

    const request = chai.request(server).get('/sales');
    request.end((err, res)=> {
      expect(res).to.have.status(200);
      expect(res.body).to.have.property('message', 'The sales: ');
      expect(res.body).to.have.property('sales');
      expect(res.body.sales).that.is.an('array').not.empty;
      stub1.restore();
      stub2.restore();
      stub3.restore();
      done();
    });
  });

  it('should throw 500 error if third party package throws an error.', function(done){
    const stub1 = sinon.stub(jwt, 'verify').returns(1);
    const stub2 = sinon.stub(Manager, 'findOne').throws(new Error('findOne\'s error occured!'));

    const request = chai.request(server).get('/sales');
    request.end((err, res)=> {
      expect(res).to.have.status(500);
      stub1.restore();
      stub2.restore();
      done();
    });
  });

});

describe('/borrowings', function(){

  it('should throw 401 error if the manager id provided does\'t match any manager id.', function(done){
    const stub1 = sinon.stub(jwt, 'verify').returns(1);
    const stub2 = sinon.stub(Manager, 'findById').resolves(0);
    
    const request = chai.request(server).get('/borrowings');
    request.end((err, res)=>{
      expect(res).to.have.status(401);
      stub1.restore();
      stub2.restore();
      done();
    });
  });

  it('should return response with 200 status code and "No borrowings to show." message if there are no borrowings.', function(done){
    const stub1 = sinon.stub(jwt, 'verify').returns(1);
    const stub2 = sinon.stub(Manager, 'findById').resolves(1);
    const stub3 = sinon.stub(Borrowing, 'find').resolves([]);

    const request = chai.request(server).get('/borrowings');
    request.end((err, res)=> {
      expect(res).to.have.status(200);
      expect(res.body).to.have.property('message', 'No borrowings to show.');

      stub1.restore();
      stub2.restore();
      stub3.restore();
      done();
    })
  });

  it('should return response with 200 status code and borrowings non empty array if there are borrowings to show.', function(done){
    const stub1 = sinon.stub(jwt, 'verify').returns(1);
    const stub2 = sinon.stub(Manager, 'findById').resolves(1);
    const stub3 = sinon.stub(Borrowing, 'find').resolves(['1', '2']);

    const request = chai.request(server).get('/borrowings');
    request.end((err, res)=> {
      expect(res).to.have.status(200);
      expect(res.body).to.have.property('borrowings');
      expect(res.body.borrowings).that.is.an('array').not.empty;

      stub1.restore();
      stub2.restore();
      stub3.restore();
      done();
    })
  });

});

  after(function(done){
    Manager.findByIdAndDelete(managerId).then(() => {
      console.log(productId);
       return Product.findByIdAndDelete(productId);
      }).then(result => {
        done()
      })
  });
})