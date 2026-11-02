import { z } from 'zod';
import { ROLES } from '../models/Role.js';
import { email, newPassword } from './auth.schema.js';
import { requiredString } from './common.schema.js';

export const update = z.object({
    name: requiredString('El nombre', 32).optional(),
    email: email.optional(),
    password: newPassword.optional(),
});

export const updateRoles = z.object({
    roles: z
        .array(z.enum(ROLES, { error: 'El rol no existe' }), { error: 'Los roles son requeridos' })
        .min(1, 'Debe asignar al menos un rol'),
});

export const listQuery = z.object({
    new: z.string().optional(),
    limit: z.coerce.number().int().positive().max(100).default(5),
});

export type UpdateUserInput = z.infer<typeof update>;
export type UpdateRolesInput = z.infer<typeof updateRoles>;
export type UserListQuery = z.infer<typeof listQuery>;
