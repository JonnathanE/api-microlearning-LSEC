import { z } from 'zod';
import { objectId, requiredString, sortQuery } from './common.schema.js';

export const create = z.object({
    name: requiredString('El nombre', 32),
    module: objectId('El módulo es requerido'),
});

export const update = create.partial();

export const listQuery = sortQuery(['name', 'module', 'createdAt'], 'module');

export type CreateLessonInput = z.infer<typeof create>;
export type UpdateLessonInput = z.infer<typeof update>;
