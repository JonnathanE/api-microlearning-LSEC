const { z } = require('zod');
const { ROLES } = require('../models/Role');
const { email, newPassword } = require('./auth.schema');
const { requiredString } = require('./common.schema');

const update = z.object({
    name: requiredString('El nombre', 32).optional(),
    email: email.optional(),
    password: newPassword.optional(),
});

const updateRoles = z.object({
    roles: z
        .array(z.enum(ROLES, { error: 'El rol no existe' }), { error: 'Los roles son requeridos' })
        .min(1, 'Debe asignar al menos un rol'),
});

const listQuery = z.object({
    new: z.string().optional(),
    limit: z.coerce.number().int().positive().max(100).default(5),
});

module.exports = { update, updateRoles, listQuery };
