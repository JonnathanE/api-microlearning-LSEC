const { z } = require('zod');
const { objectId, requiredString, sortQuery } = require('./common.schema');

const create = z.object({
    title: requiredString('El título', 32),
    lesson: objectId('La lección es requerida'),
});

module.exports = { create, update: create.partial(), listQuery: sortQuery(['title', 'lesson', 'createdAt'], 'title') };
