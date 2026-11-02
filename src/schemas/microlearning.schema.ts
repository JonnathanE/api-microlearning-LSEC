import { z } from 'zod';
import { objectId, requiredString, sortQuery } from './common.schema.js';

export const create = z.object({
    title: requiredString('El título', 32),
    lesson: objectId('La lección es requerida'),
});

export const update = create.partial();

export const listQuery = sortQuery(['title', 'lesson', 'createdAt'], 'title');

export type CreateMicrolearningInput = z.infer<typeof create>;
export type UpdateMicrolearningInput = z.infer<typeof update>;
