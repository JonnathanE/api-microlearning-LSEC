import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { Request } from 'express';
import fileUpload from 'express-fileupload';
import { PayloadTooLargeError, ValidationError } from '../errors/http-errors.js';
import type { AnyRequestHandler } from '../types/http.js';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(['image/png', 'image/jpeg', 'image/gif', 'image/webp']);

/**
 * Removes the temporary files once the response has been sent
 */
const removeTempFiles: AnyRequestHandler = (req, res, next) => {
    res.on('close', () => {
        for (const file of Object.values(req.files ?? {}).flat()) {
            fs.promises.rm(file.tempFilePath, { force: true }).catch((err) => req.log.warn({ err }));
        }
    });
    next();
};

// it must be mounted after the authentication so anonymous users cannot write to the disk
export const upload: AnyRequestHandler[] = [
    fileUpload({
        useTempFiles: true,
        tempFileDir: path.join(os.tmpdir(), 'lsec-uploads'),
        limits: { fileSize: MAX_FILE_SIZE },
    }),
    removeTempFiles,
];

/**
 * Requires one valid image per field
 * @param fields names of the form fields
 * @param maxSize maximum size of each image in bytes
 */
export const requireImages =
    (fields: string[], maxSize = MAX_FILE_SIZE): AnyRequestHandler =>
    (req, res, next) => {
        for (const field of fields) {
            const file = req.files?.[field];
            if (!file || Array.isArray(file)) {
                throw new ValidationError(`Debe enviar un archivo en el campo ${field}`, [
                    { field, message: 'Archivo requerido' },
                ]);
            }
            if (file.truncated || file.size > maxSize) {
                throw new PayloadTooLargeError(`El archivo del campo ${field} supera los ${maxSize / 1000000} MB`);
            }
            if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
                throw new ValidationError(`El archivo del campo ${field} debe ser PNG, JPEG, GIF o WEBP`, [
                    { field, message: 'Formato no permitido' },
                ]);
            }
        }
        next();
    };

/**
 * Returns an uploaded file. The requireImages middleware must have checked the field.
 */
export const uploadedFile = (req: Pick<Request, 'files'>, field: string) => {
    const file = req.files?.[field];
    if (!file || Array.isArray(file)) {
        throw new ValidationError(`Debe enviar un archivo en el campo ${field}`);
    }
    return file;
};
