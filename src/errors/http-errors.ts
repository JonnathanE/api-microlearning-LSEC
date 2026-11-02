export interface ErrorDetail {
    field: string;
    message: string;
}

export class AppError extends Error {
    constructor(
        readonly status: number,
        readonly code: string,
        message: string,
        readonly details?: ErrorDetail[],
    ) {
        super(message);
    }
}

export class ValidationError extends AppError {
    constructor(message: string, details?: ErrorDetail[]) {
        super(400, 'VALIDATION_ERROR', message, details);
    }
}

export class UnauthorizedError extends AppError {
    constructor(message = 'No autorizado') {
        super(401, 'UNAUTHORIZED', message);
    }
}

export class ForbiddenError extends AppError {
    constructor(message: string) {
        super(403, 'FORBIDDEN', message);
    }
}

export class NotFoundError extends AppError {
    constructor(message: string) {
        super(404, 'NOT_FOUND', message);
    }
}

export class ConflictError extends AppError {
    constructor(message: string) {
        super(409, 'CONFLICT', message);
    }
}

export class PayloadTooLargeError extends AppError {
    constructor(message: string) {
        super(413, 'PAYLOAD_TOO_LARGE', message);
    }
}

export class UploadError extends AppError {
    constructor() {
        super(502, 'UPLOAD_FAILED', 'No se pudo procesar el archivo. Intente de nuevo');
    }
}
