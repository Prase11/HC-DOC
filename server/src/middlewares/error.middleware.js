import ApiResponse from '../utils/response.js';

export const errorHandler = (err, req, res, next) => {
    console.error('❌ Error:', err.message);

    if (err.name === 'SequelizeValidationError') {
        const errors = err.errors.map(e => ({ field: e.path, message: e.message }));
        return ApiResponse.validationError(res, errors);
    }

    if (err.name === 'SequelizeUniqueConstraintError') {
        const errors = err.errors.map(e => ({ field: e.path, message: `${e.path} already exists` }));
        return ApiResponse.error(res, 'Duplicate entry', 409, errors);
    }

    if (err.name === 'SequelizeDatabaseError') {
        return ApiResponse.error(res, 'Database error', 500);
    }

    if (err.name === 'SequelizeConnectionError') {
        return ApiResponse.error(res, 'Database connection failed', 503);
    }

    if (err.statusCode) {
        return ApiResponse.error(res, err.message, err.statusCode);
    }

    return ApiResponse.error(
        res,
        process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
        500
    );
};

export const notFoundHandler = (req, res) => {
    return ApiResponse.notFound(res, `Route ${req.method} ${req.originalUrl} not found`);
};
