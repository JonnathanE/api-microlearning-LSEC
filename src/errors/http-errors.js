class AppError extends Error {
    constructor(status, code, message, details) {
        super(message);
        this.status = status;
        this.code = code;
        this.details = details;
    }
}

class ValidationError extends AppError {
    constructor(message, details) {
        super(400, 'VALIDATION_ERROR', message, details);
    }
}

class UnauthorizedError extends AppError {
    constructor(message = 'No autorizado') {
        super(401, 'UNAUTHORIZED', message);
    }
}

class ForbiddenError extends AppError {
    constructor(message) {
        super(403, 'FORBIDDEN', message);
    }
}

class NotFoundError extends AppError {
    constructor(message) {
        super(404, 'NOT_FOUND', message);
    }
}

class ConflictError extends AppError {
    constructor(message) {
        super(409, 'CONFLICT', message);
    }
}

class PayloadTooLargeError extends AppError {
    constructor(message) {
        super(413, 'PAYLOAD_TOO_LARGE', message);
    }
}

class UploadError extends AppError {
    constructor() {
        super(502, 'UPLOAD_FAILED', 'No se pudo procesar el archivo. Intente de nuevo');
    }
}

module.exports = {
    AppError,
    ValidationError,
    UnauthorizedError,
    ForbiddenError,
    NotFoundError,
    ConflictError,
    PayloadTooLargeError,
    UploadError,
};
