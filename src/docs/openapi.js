const { z } = require('zod');
const authSchemas = require('../schemas/auth.schema');
const cardSchemas = require('../schemas/card.schema');
const lessonSchemas = require('../schemas/lesson.schema');
const microlearningSchemas = require('../schemas/microlearning.schema');
const moduleSchemas = require('../schemas/module.schema');
const userSchemas = require('../schemas/user.schema');

const toJsonSchema = (schema) => z.toJSONSchema(schema, { io: 'input', unrepresentable: 'any' });

const binary = { type: 'string', format: 'binary' };

const multipart = (schema, files) => {
    const { properties = {}, required = [] } = schema ? toJsonSchema(schema) : {};
    return {
        type: 'object',
        properties: { ...properties, ...Object.fromEntries(files.map((file) => [file, binary])) },
        required: [...required, ...files],
    };
};

const errorResponse = (description) => ({
    description,
    content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
});

/**
 * Builds an OpenAPI operation
 * @param {string} tag
 * @param {string} summary
 * @param {Object} [options]
 * @param {boolean} [options.auth] requires the Bearer token
 * @param {string[]} [options.path] names of the path params
 * @param {Object} [options.query] zod schema of the query
 * @param {Object} [options.body] zod schema of the body
 * @param {string[]} [options.files] names of the form fields with files
 * @param {number} [options.success] status of the successful response
 */
const op = (tag, summary, { auth, path = [], query, body, files, success = 200 } = {}) => {
    const queryParams = query ? Object.entries(toJsonSchema(query).properties) : [];
    const operation = {
        tags: [tag],
        summary,
        parameters: [
            ...path.map((name) => ({ name, in: 'path', required: true, schema: { type: 'string' } })),
            ...queryParams.map(([name, schema]) => ({ name, in: 'query', schema })),
        ],
        responses: {
            [success]: { description: 'Operación correcta' },
            400: errorResponse('Datos no válidos'),
            ...(auth && { 401: errorResponse('Token ausente o no válido'), 403: errorResponse('Sin permisos') }),
            ...(path.length > 0 && { 404: errorResponse('No encontrado') }),
        },
    };
    if (auth) operation.security = [{ bearerAuth: [] }];
    if (files) {
        operation.requestBody = {
            required: true,
            content: { 'multipart/form-data': { schema: multipart(body, files) } },
        };
    } else if (body) {
        operation.requestBody = { required: true, content: { 'application/json': { schema: toJsonSchema(body) } } };
    }
    return operation;
};

const session = 'Devuelve el token, el nombre y el correo';

module.exports = {
    openapi: '3.1.0',
    info: {
        title: 'API Microlearning LSEC',
        description: 'API para enseñar Lengua de Señas Ecuatoriana mediante microlearning.',
        version: require('../../package.json').version,
    },
    components: {
        securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } },
        schemas: {
            Error: {
                type: 'object',
                required: ['error', 'code'],
                properties: {
                    error: { type: 'string' },
                    code: { type: 'string' },
                    details: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: { field: { type: 'string' }, message: { type: 'string' } },
                        },
                    },
                },
            },
        },
    },
    paths: {
        '/health': { get: op('Sistema', 'Estado del servicio') },
        '/api/auth/signup': {
            post: op('Auth', `Registra un estudiante. ${session}`, { body: authSchemas.signup, success: 201 }),
        },
        '/api/auth/signin': { post: op('Auth', `Inicia sesión. ${session}`, { body: authSchemas.signin }) },
        '/api/auth/signinadmin': {
            post: op('Auth', `Inicia sesión como administrador. ${session}`, { body: authSchemas.signin }),
        },
        '/api/user': { get: op('Usuarios', 'Lista los usuarios', { auth: true, query: userSchemas.listQuery }) },
        '/api/user/find': { get: op('Usuarios', 'Obtiene el usuario del token', { auth: true }) },
        '/api/user/find/{userId}': { get: op('Usuarios', 'Obtiene un usuario', { auth: true, path: ['userId'] }) },
        '/api/user/{userId}': {
            put: op('Usuarios', 'Actualiza el propio usuario, o cualquiera si es administrador', {
                auth: true,
                path: ['userId'],
                body: userSchemas.update,
            }),
            delete: op('Usuarios', 'Elimina un usuario', { auth: true, path: ['userId'], success: 204 }),
        },
        '/api/user/{userId}/roles': {
            put: op('Usuarios', 'Cambia los roles de otro usuario', {
                auth: true,
                path: ['userId'],
                body: userSchemas.updateRoles,
            }),
        },
        '/api/module': {
            get: op('Módulos', 'Lista los módulos'),
            post: op('Módulos', 'Crea un módulo', { auth: true, body: moduleSchemas.create, success: 201 }),
        },
        '/api/module/{moduleId}': {
            get: op('Módulos', 'Obtiene un módulo', { path: ['moduleId'] }),
            put: op('Módulos', 'Actualiza un módulo', {
                auth: true,
                path: ['moduleId'],
                body: moduleSchemas.update,
            }),
            delete: op('Módulos', 'Elimina un módulo sin lecciones (409 si tiene)', {
                auth: true,
                path: ['moduleId'],
                success: 204,
            }),
        },
        '/api/lesson': {
            get: op('Lecciones', 'Lista las lecciones', { query: lessonSchemas.listQuery }),
            post: op('Lecciones', 'Crea una lección', {
                auth: true,
                body: lessonSchemas.create,
                files: ['icon'],
                success: 201,
            }),
        },
        '/api/lesson/{lessonId}': {
            get: op('Lecciones', 'Obtiene una lección', { path: ['lessonId'] }),
            put: op('Lecciones', 'Actualiza una lección', {
                auth: true,
                path: ['lessonId'],
                body: lessonSchemas.update,
            }),
            delete: op('Lecciones', 'Elimina una lección sin contenido (409 si tiene)', {
                auth: true,
                path: ['lessonId'],
                success: 204,
            }),
        },
        '/api/lesson/icon/{lessonId}': {
            get: op('Lecciones', 'Redirige al ícono de la lección', { path: ['lessonId'], success: 302 }),
        },
        '/api/lesson/icon/update/{lessonId}': {
            put: op('Lecciones', 'Reemplaza el ícono (máximo 1 MB)', {
                auth: true,
                path: ['lessonId'],
                files: ['icon'],
            }),
        },
        '/api/micro': {
            get: op('Microcontenidos', 'Lista los microcontenidos', { query: microlearningSchemas.listQuery }),
            post: op('Microcontenidos', 'Crea un microcontenido', {
                auth: true,
                body: microlearningSchemas.create,
                files: ['image', 'gif'],
                success: 201,
            }),
        },
        '/api/micro/{microId}': {
            get: op('Microcontenidos', 'Obtiene un microcontenido', { path: ['microId'] }),
            put: op('Microcontenidos', 'Actualiza un microcontenido', {
                auth: true,
                path: ['microId'],
                body: microlearningSchemas.update,
            }),
            delete: op('Microcontenidos', 'Elimina un microcontenido', {
                auth: true,
                path: ['microId'],
                success: 204,
            }),
        },
        '/api/micro/image/{microId}': {
            put: op('Microcontenidos', 'Reemplaza la imagen', { auth: true, path: ['microId'], files: ['image'] }),
        },
        '/api/micro/gif/{microId}': {
            put: op('Microcontenidos', 'Reemplaza el GIF', { auth: true, path: ['microId'], files: ['gif'] }),
        },
        '/api/card': {
            get: op('Tarjetas', 'Lista las tarjetas', { query: cardSchemas.listQuery }),
            post: op('Tarjetas', 'Crea una tarjeta', {
                auth: true,
                body: cardSchemas.create,
                files: ['gif'],
                success: 201,
            }),
        },
        '/api/card/{cardId}': {
            get: op('Tarjetas', 'Obtiene una tarjeta', { path: ['cardId'] }),
            put: op('Tarjetas', 'Actualiza una tarjeta', { auth: true, path: ['cardId'], body: cardSchemas.update }),
            delete: op('Tarjetas', 'Elimina una tarjeta', { auth: true, path: ['cardId'], success: 204 }),
        },
        '/api/card/gif/{cardId}': {
            put: op('Tarjetas', 'Reemplaza el GIF', { auth: true, path: ['cardId'], files: ['gif'] }),
        },
        '/api/home/modules': { get: op('Inicio', 'Lista los módulos que tienen lecciones') },
        '/api/home/lessons/{moduleId}': {
            get: op('Inicio', 'Lista las lecciones de un módulo', { path: ['moduleId'] }),
        },
        '/api/home/learn/{lessonId}': {
            get: op('Inicio', 'Lista los microcontenidos de una lección; con page, de uno en uno', {
                path: ['lessonId'],
            }),
        },
        '/api/home/card/{lessonId}': {
            get: op('Inicio', 'Lista las tarjetas de una lección; con page, de una en una', { path: ['lessonId'] }),
        },
        '/api/home/complete/lesson/{lessonId}': {
            put: op('Inicio', 'Marca una lección como completada', { auth: true, path: ['lessonId'] }),
        },
        '/api/home/complete/learn': { get: op('Inicio', 'Obtiene el progreso del usuario', { auth: true }) },
    },
};
