const AppError = require('./../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.keyValue.name;
  const message = `Duplicate field ${value}. Please use another value`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `Invalid input data ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () => {
  return new AppError(`Invalid Token please login again`, 401);
};

const handleJWTExpires = () => {
  return new AppError(`Your Token has expired please login again`, 401);
};

const sendErrorDev = (err, req, res) => {
  // API
  if (req.originalUrl.startsWith('/api')) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      stack: err.stack,
      error: err,
    });
  } else {
    // rendered website
    res.status(err.statusCode).render('error', {
      title: 'Something went WRONG :(',
      msg: err.message,
    });
  }
};

const sendErrorProd = (err, req, res) => {
  // Opeartional error that we trust
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    } else {
      // programming or other unknown error
      // we dont want to leak it to client
      console.error('ERROR 💥');
      res.status(500).json({
        status: 'error',
        message: err,
      });
    }
  } else {
    // renderred website
    if (err.isOperational) {
      res.status(err.statusCode).render('error', {
        title: 'Something went WRONG :(',
        msg: err.message,
      });
    } else {
      // programming or other unknown error
      // we dont want to leak it to client
      console.error('ERROR 💥');
      res.status(err.statusCode).render('error', {
        title: 'Something went WRONG :(',
        msg: 'Please try again later',
      });
    }
  }
};
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;
    if (error.name === 'CastError') {
      error = handleCastErrorDB(error);
    }
    if (error.code === 11000) {
      error = handleDuplicateFieldsDB(error);
    }
    if (error._message === 'Validation failed') {
      error = handleValidationErrorDB(error);
    }

    if (error.name === 'JsonWebTokenError') {
      error = handleJWTError();
    }

    if (error.name === 'TokenExpiredError') {
      error = handleJWTExpires();
    }

    sendErrorProd(error, req, res);
  }
};
