const { z } = require('zod');
const { objectId, requiredString, sortQuery } = require('./common.schema');

const create = z.object({
    question: requiredString('La pregunta', 100),
    lesson: objectId('La lección es requerida'),
    correctAnswer: requiredString('La respuesta correcta', 100),
    wrongAnswer: requiredString('La respuesta incorrecta', 100),
});

module.exports = {
    create,
    update: create.partial(),
    listQuery: sortQuery(['question', 'lesson', 'createdAt'], 'question'),
};
