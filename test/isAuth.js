const isAuth = require('../middleware/isAuth');
const { expect } = require('chai');
const sinon = require('sinon');
const jwt = require('jsonwebtoken');
describe('isAuth middleware', function(){
    it('should throw 401 error if jwt tokej verification failed.', function(){
        const req = {
            get: function(headerName){
                return null;
            }
        }
        expect(isAuth.bind(this, req, {}, (param)=>{if(param instanceof Error)throw param})).to.throw();
    });
});