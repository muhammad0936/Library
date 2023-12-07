const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {

    let token = req.get('Authorization');
    if(token)
    {
        token = token.split(' ')[1];
    }
    let decodedToken;
    try{
        decodedToken = jwt.verify(token, 'thisismysecretkey');
        if(!decodedToken)
        {
            const error = new Error('Not authenticated!');
            error.statusCode = 401;
            throw error;
        }
        req.userId = decodedToken.userId;
        next();
    }catch(error)
    {
    if(!error.statusCode)
        error.statusCode = 500;
    next(error);
    }

}
