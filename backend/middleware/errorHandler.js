const constants = require('../config/constants');

class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        console.error('Error:', {
            message: err.message,
            stack: err.stack,
            path: req.path,
            method: req.method,
            body: req.body,
            params: req.params,
            query: req.query,
            user: req.user ? req.user.id : 'Unauthenticated'
        });
    }

    let errorResponse = {
        status: 'error',
        message: err.message || constants.MESSAGES.SERVER_ERROR
    };

    if (err.errors) {
        errorResponse.errors = err.errors;
    }

    if (process.env.NODE_ENV === 'development' && err.stack) {
        errorResponse.stack = err.stack;
    }

    if (err.name === 'ValidationError') {
        errorResponse.message = constants.MESSAGES.VALIDATION_ERROR;
        errorResponse.errors = Object.values(err.errors).map(e => ({
            field: e.path,
            message: e.message
        }));
        err.statusCode = 400;
    }

    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern)[0];
        errorResponse.message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
        err.statusCode = 400;
    }

    if (err.name === 'JsonWebTokenError') {
        errorResponse.message = 'Invalid token';
        err.statusCode = 401;
    }

    if (err.name === 'TokenExpiredError') {
        errorResponse.message = 'Token expired';
        err.statusCode = 401;
    }

    if (err.name === 'CastError') {
        errorResponse.message = `Invalid ${err.path}: ${err.value}`;
        err.statusCode = 400;
    }

    res.status(err.statusCode).json(errorResponse);
};

const notFoundHandler = (req, res, next) => {
    const error = new AppError(`Cannot ${req.method} ${req.originalUrl}`, 404);
    next(error);
};

const catchAsync = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};

const rateLimitHandler = (req, res, next) => {
    const error = new AppError('Too many requests, please try again later.', 429);
    next(error);
};

const corsErrorHandler = (err, req, res, next) => {
    if (err) {
        return res.status(403).json({
            status: 'error',
            message: 'CORS policy violation'
        });
    }
    next();
};

module.exports = {
    AppError,
    errorHandler,
    notFoundHandler,
    catchAsync,
    rateLimitHandler,
    corsErrorHandler
};