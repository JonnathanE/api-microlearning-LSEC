import { z } from 'zod';

export const objectId = (message = 'El identificador no es válido') =>
    z.string({ error: message }).regex(/^[0-9a-fA-F]{24}$/, message);

export const requiredString = (label: string, maxLength: number) =>
    z
        .string({ error: `${label} es requerido` })
        .trim()
        .min(1, `${label} es requerido`)
        .max(maxLength, `${label} no puede superar los ${maxLength} caracteres`);

/** Schema of the route params that are ids, e.g. idParams('moduleId') */
export const idParams = (...names: string[]) => z.object(Object.fromEntries(names.map((name) => [name, objectId()])));

export const paginationQuery = z.object({
    page: z.coerce.number({ error: 'La página no es válida' }).int().positive('La página no es válida').optional(),
});

export type PaginationQuery = z.infer<typeof paginationQuery>;

/** Schema of the query of the listings. The sortable fields are limited to a whitelist */
export const sortQuery = (fields: [string, ...string[]], defaultField: string) =>
    z.object({
        sortBy: z.enum(fields, { error: 'El campo de ordenamiento no es válido' }).default(defaultField),
        order: z.enum(['asc', 'desc'], { error: 'El orden debe ser asc o desc' }).default('asc'),
    });

export type SortQuery = z.infer<ReturnType<typeof sortQuery>>;
