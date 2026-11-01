const { z } = require('zod');
const { requiredString } = require('./common.schema');

const email = z
    .string({ error: 'El correo electrónico es requerido' })
    .trim()
    .toLowerCase()
    .pipe(z.email('El correo electrónico no es válido'));

const newPassword = z
    .string({ error: 'La contraseña es requerida' })
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(128, 'La contraseña no puede superar los 128 caracteres');

const signup = z.object({
    name: requiredString('El nombre', 32),
    email,
    password: newPassword,
});

const signin = z.object({
    email,
    password: z.string({ error: 'La contraseña es requerida' }).min(1, 'La contraseña es requerida'),
});

module.exports = { email, newPassword, signup, signin };
