const { z } = require('zod');
const { objectId, requiredString, sortQuery } = require('./common.schema');

const create = z.object({
    name: requiredString('El nombre', 32),
    module: objectId('El módulo es requerido'),
});

module.exports = { create, update: create.partial(), listQuery: sortQuery(['name', 'module', 'createdAt'], 'module') };
