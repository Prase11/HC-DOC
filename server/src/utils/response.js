/**
 * Standard API Response Helper
 */
class ApiResponse {
    static success(res, data = null, message = 'Success', statusCode = 200) {
        return res.status(statusCode).json({ success: true, message, data });
    }

    static paginated(res, data, total, page, limit, message = 'Data retrieved successfully') {
        return res.status(200).json({
            success: true,
            message,
            data,
            pagination: {
                total,
                page: parseInt(page, 10),
                limit: parseInt(limit, 10),
                totalPages: Math.ceil(total / limit)
            }
        });
    }

    static error(res, message = 'Internal server error', statusCode = 500, errors = null) {
        const response = { success: false, message };
        if (errors) response.errors = errors;
        return res.status(statusCode).json(response);
    }

    static notFound(res, message = 'Resource not found') {
        return res.status(404).json({ success: false, message });
    }

    static validationError(res, errors) {
        return res.status(422).json({ success: false, message: 'Validation failed', errors });
    }

    static created(res, data, message = 'Resource created successfully') {
        return ApiResponse.success(res, data, message, 201);
    }
}

export default ApiResponse;
