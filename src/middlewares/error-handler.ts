import type { ErrorRequestHandler, RequestHandler } from 'express';
import mongoose from 'mongoose';
import { AppError, ConflictError, NotFoundError, ValidationError } from '../errors/http-errors.js';

const FIELD_LABELS: Record<string, string> = {
    email: 'El correo electrónico',
    name: 'El nombre',
    number: 'El número',
};

interface LibraryError {
    code?: number;
    keyPattern?: Record<string, unknown>;
    status?: number;
}

/**
 * Translates errors thrown by the libraries into the errors of the API
 */
const normalizeError = (err: unknown): AppError => {
    if (err instanceof AppError) return err;
    const { code, keyPattern, status } = (err ?? {}) as LibraryError;
    if (code === 11000) {
        const field = Object.keys(keyPattern ?? {})[0] ?? '';
        return new ConflictError(`${FIELD_LABELS[field] ?? 'El valor'} ya existe`);
    }
    if (err instanceof mongoose.Error.ValidationError) {
        const details = Object.values(err.errors).map(({ path, message }) => ({ field: path, message }));
        return new ValidationError('Los datos enviados no son válidos', details);
    }
    if (err instanceof mongoose.Error.CastError) {
        return new ValidationError('Los datos enviados no son válidos');
    }
    // errors of express.json(), such as a malformed body
    if (status && status >= 400 && status < 500) {
        return new AppError(status, 'BAD_REQUEST', 'La petición no es válida');
    }
    return new AppError(500, 'INTERNAL_ERROR', 'Error interno del servidor');
};

export const notFound: RequestHandler = () => {
    throw new NotFoundError('La ruta solicitada no existe');
};

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    if (res.headersSent) {
        next(err);
        return;
    }
    const { status, code, message, details } = normalizeError(err);
    if (status >= 500) req.log.error({ err }, message);
    res.status(status).json({ error: message, code, details });
};
