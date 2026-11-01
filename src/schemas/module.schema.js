const { z } = require('zod');
const { requiredString } = require('./common.schema');

const create = z.object({
    number: z.coerce
        .number({ error: 'El número del módulo es requerido' })
        .int('El número del módulo debe ser entero')
        .positive('El número del módulo debe ser positivo'),
    name: requiredString('El nombre', 32),
});

module.exports = { create, update: create.partial() };
