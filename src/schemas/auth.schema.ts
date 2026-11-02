import { z } from 'zod';
import { requiredString } from './common.schema.js';

export const email = z
    .string({ error: 'El correo electrónico es requerido' })
    .trim()
    .toLowerCase()
    .pipe(z.email('El correo electrónico no es válido'));

export const newPassword = z
    .string({ error: 'La contraseña es requerida' })
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(128, 'La contraseña no puede superar los 128 caracteres');

export const signup = z.object({
    name: requiredString('El nombre', 32),
    email,
    password: newPassword,
});

export const signin = z.object({
    email,
    password: z.string({ error: 'La contraseña es requerida' }).min(1, 'La contraseña es requerida'),
});

export type SignupInput = z.infer<typeof signup>;
export type SigninInput = z.infer<typeof signin>;
