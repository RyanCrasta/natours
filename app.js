const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const path = require('path');
var cors = require('cors');
const compression = require('compression');

const rateLimit = require('express-rate-limit');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes.js');
const userRouter = require('./routes/userRoutes.js');
const reviewRouter = require('./routes/reviewRoutes.js');
const viewRouter = require('./routes/viewRoutes.js');
const bookingRouter = require('./routes/bookingRoutes.js');

const cookieParser = require('cookie-parser');

const app = express();
// GLOBAL MIDDLEWARE

app.use(cors({ origin: true, credentials: true }));

app.set('view engine', 'pug');

app.set('views', path.join(__dirname, 'views'));

// app.use(function (req, res, next) {
//   res.setHeader(
//     'Content-Security-Policy',
//     "script-src 'self' https://cdnjs.cloudflare.com/ajax/libs/axios/0.24.0/axios.min.js"
//   );
//   return next();
// });

// serving static file
// app.use(express.static(`${__dirname}/public`));
app.use(express.static(path.join(__dirname, 'public')));

// set security HTTP headers
app.use(helmet());

// development loging
if (process.env.NODE_ENV === 'development') {
  // it will display log whatever requests u make
  // its a 3rd party middleware
  app.use(morgan('dev'));
}

// 1hr meh only 100 requests plis
const limiter = rateLimit({
  max: 100,
  wndowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an houw',
});

app.use('/api', limiter);

// middleware express.json()
// fn that can modify incoming req data
// data from body is added to req
// body parser, reading data from body
app.use(
  express.json({
    limit: '10kb',
  })
);

app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Data Sanitization against NoSQL query injection
// mongoSanitize will return middleware fn
// it will remove all $ and .
app.use(mongoSanitize());

// Data Sanitization against XSS
app.use(xss());

// Preventing Parameter Pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

app.use(compression());

// Test middleware
app.use((req, res, next) => {
  console.log('HELLO life jhand');
  // console.log(req.headers);
  next(); //if not next then request response cycle will be stuck
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.cookies);
  next();
});

// route handler: callback fn inside app.get()
// app.get('/api/v1/tours', getAllTours);

// responding to URL parameters
// if we want to add optional paramter use ?
// eg '/api/v1/tours/:id/:y?'
// app.get('/api/v1/tours/:id', getTour);

// client to server data sending
// data available on req
// out of box express does not put body data on req
// so use middleware
// app.post('/api/v1/tours', createTour);

// app.patch('/api/v1/tours/:id', updateTour);

// app.delete('/api/v1/tours/:id', deleteTour);
// app.use((req, res, next) => {
//   res.header('Access-Control-Allow-Origin', '*');
//   next();
// });

// app.use(function (req, res, next) {
//   res.setHeader(
//     'Content-Security-Policy',
//     "default-src 'self'; font-src 'self'; img-src 'self' https://cdnjs.com; script-src 'self'; style-src 'self' https://fonts.googleapis.com https://cdnjs.cloudflare.com/ajax/libs/axios/0.24.0/axios.min.js; frame-src 'self'"
//   );
//   next();
// });

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

// Handling Unhandled Routes

app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Can't find ${req.originalUrl} on this server`,
  // });
  // next();

  // const err = new Error("Can't find anything");
  // err.status = 'fail';
  // err.statusCode = 404;

  next(new AppError("Can't find anything", 404));
});

// ERROR handling middleware
app.use(globalErrorHandler);

module.exports = app;
