require('dotenv').config();
const express = require('express');
const app = express();
const multer = require('multer');
const body_parser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const cron = require('node-cron');
const http = require('http');

const isAuth = require('./middleware/isAuth');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const customerRoutes = require('./routes/customer');

const moveBorrowedToSold = require('./util/moveBorrowedToSold');

const connectToDatabase = require('./database/connection');
const { Stream } = require('stream');

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'images');
    },
    filename: (req, file, cb) => {
      cb(null, new Date().getTime() + '-' + file.originalname);
    }
  });
  
  
  const fileFilter = (req, file, cb) => {
    if (
      file.mimetype === 'image/png' ||
      file.mimetype === 'image/jpg' ||
      file.mimetype === 'image/jpeg'
    ) {
      cb(null, true);
    } else {
      const error = new Error('You are trying to upload files which are not images, Upload just images with png, jpg, or jpeg extention.');
      error.statusCode = 422;
      cb(error, false);
    }
  };

app.use(cors());
app.use(helmet());
app.use(compression());
const accessLogStream = fs.createWriteStream(path.join(__dirname,'data', 'access.log'),{ flags: 'a' });
app.use(morgan('tiny',{ stream : accessLogStream}));
app.use(body_parser.json())
app.use(
    multer({ storage: fileStorage, fileFilter: fileFilter }).array('images',5)
  );
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use((req, res, next) => { 
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
      'Access-Control-Allow-Methods',
      'OPTIONS, GET, POST, PUT, PATCH, DELETE'
    );
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  //send a request with error to attach with error handling middleware

  //--------
  try{
      // cron.schedule('1 0 * * *',() => {
      //   moveBorrowedToSold();
      // })
      cron.schedule('0 0 0 * * *',async() => {
        try{
          await moveBorrowedToSold();

        }catch(err)
        {
          const options = {
            hostname: 'localhost',
            port: 3000,
            path: '/throwError',
            method: 'POST',
            headers: {
              'content-type': 'application/json'
            }
          };
          
          const req = http.request(options, res => {
            res.on('data', d => {
              process.stdout.write(d);
            });
          });
          req.write(JSON.stringify({
              error : err.message
            }))
          req.end();

        }
      })
  }catch(err)
  {
    if (err)
    console.log(err)
  }

app.use(authRoutes);
app.use(adminRoutes);
app.use(customerRoutes);

app.post('/throwError', (req, res, next) => {
  const err = new Error(req.body.error);
  next(err);
});

app.use((req, res, next) => {
  res.status(404).json({message : 'Page not found!'});
})
app.use((error, req, res, next) => {
    console.log('error : ');
    console.log(error);
    res.status(error.statusCode || error[0].statusCode || 500).json({result: error.message || error.map(i => i.msg) || 'an error occurred!'});
});
connectToDatabase(process.env.MONGO_STRING)
.then(result => {
    app.listen(3000);
    console.log("connected successfully.")
})
.catch(err => {
    if(err)
    console.log("Connection to the database failed!, ");
    console.log(err);
});
module.exports = app;
