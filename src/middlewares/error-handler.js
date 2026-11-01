const mongoose = require('mongoose');
const { AppError, ConflictError, NotFoundError, ValidationError } = require('../errors/http-errors');

const FIELD_LABELS = { email: 'El correo electrónico', name: 'El nombre', number: 'El número' };

/**
 * Translates errors thrown by the libraries into the errors of the API
 */
const normalizeError = (err) => {
    if (err instanceof AppError) return err;
    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern ?? {})[0];
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
    if (err.status >= 400 && err.status < 500) {
        return new AppError(err.status, 'BAD_REQUEST', 'La petición no es válida');
    }
    return new AppError(500, 'INTERNAL_ERROR', 'Error interno del servidor');
};

const notFound = () => {
    throw new NotFoundError('La ruta solicitada no existe');
};

const errorHandler = (err, req, res, next) => {
    if (res.headersSent) return next(err);
    const { status, code, message, details } = normalizeError(err);
    if (status >= 500) req.log.error({ err }, message);
    return res.status(status).json({ error: message, code, details });
};

module.exports = { notFound, errorHandler };
