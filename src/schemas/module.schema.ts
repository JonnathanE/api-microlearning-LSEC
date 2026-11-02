import { z } from 'zod';
import { requiredString } from './common.schema.js';

export const create = z.object({
    number: z.coerce
        .number({ error: 'El número del módulo es requerido' })
        .int('El número del módulo debe ser entero')
        .positive('El número del módulo debe ser positivo'),
    name: requiredString('El nombre', 32),
});

export const update = create.partial();

export type CreateModuleInput = z.infer<typeof create>;
export type UpdateModuleInput = z.infer<typeof update>;
