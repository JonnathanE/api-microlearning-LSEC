const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const fileUpload = require('express-fileupload');
const { PayloadTooLargeError, ValidationError } = require('../errors/http-errors');

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(['image/png', 'image/jpeg', 'image/gif', 'image/webp']);

/**
 * Removes the temporary files once the response has been sent
 */
const removeTempFiles = (req, res, next) => {
    res.on('close', () => {
        for (const file of Object.values(req.files ?? {}).flat()) {
            fs.promises.rm(file.tempFilePath, { force: true }).catch((err) => req.log.warn({ err }));
        }
    });
    next();
};

// it must be mounted after the authentication so anonymous users cannot write to the disk
const upload = [
    fileUpload({
        useTempFiles: true,
        tempFileDir: path.join(os.tmpdir(), 'lsec-uploads'),
        limits: { fileSize: MAX_FILE_SIZE },
    }),
    removeTempFiles,
];

/**
 * Requires one valid image per field
 * @param {string[]} fields names of the form fields
 * @param {number} [maxSize] maximum size of each image in bytes
 */
const requireImages =
    (fields, maxSize = MAX_FILE_SIZE) =>
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

module.exports = { upload, requireImages };
