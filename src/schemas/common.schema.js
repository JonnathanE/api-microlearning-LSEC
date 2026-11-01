const { z } = require('zod');

const objectId = (message = 'El identificador no es válido') =>
    z.string({ error: message }).regex(/^[0-9a-fA-F]{24}$/, message);

const requiredString = (label, maxLength) =>
    z
        .string({ error: `${label} es requerido` })
        .trim()
        .min(1, `${label} es requerido`)
        .max(maxLength, `${label} no puede superar los ${maxLength} caracteres`);

/** Schema of the route params that are ids, e.g. idParams('moduleId') */
const idParams = (...names) => z.object(Object.fromEntries(names.map((name) => [name, objectId()])));

const paginationQuery = z.object({
    page: z.coerce.number({ error: 'La página no es válida' }).int().positive('La página no es válida').optional(),
});

/** Schema of the query of the listings. The sortable fields are limited to a whitelist */
const sortQuery = (fields, defaultField) =>
    z.object({
        sortBy: z.enum(fields, { error: 'El campo de ordenamiento no es válido' }).default(defaultField),
        order: z.enum(['asc', 'desc'], { error: 'El orden debe ser asc o desc' }).default('asc'),
    });

module.exports = { objectId, requiredString, idParams, paginationQuery, sortQuery };
