import { z } from 'zod';
import { objectId, requiredString, sortQuery } from './common.schema.js';

export const create = z.object({
    question: requiredString('La pregunta', 100),
    lesson: objectId('La lección es requerida'),
    correctAnswer: requiredString('La respuesta correcta', 100),
    wrongAnswer: requiredString('La respuesta incorrecta', 100),
});

export const update = create.partial();

export const listQuery = sortQuery(['question', 'lesson', 'createdAt'], 'question');

export type CreateCardInput = z.infer<typeof create>;
export type UpdateCardInput = z.infer<typeof update>;
