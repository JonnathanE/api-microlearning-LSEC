const { ValidationError } = require('../errors/http-errors');

const parse = (schema, data) => {
    const result = schema.safeParse(data);
    if (result.success) return result.data;
    const details = result.error.issues.map((issue) => ({ field: issue.path.join('.'), message: issue.message }));
    throw new ValidationError(details[0].message, details);
};

/**
 * Validates the request with zod schemas. The parsed values replace req.params and req.body.
 * req.query is read-only in Express 5, so the parsed query is stored in req.validatedQuery.
 */
const validate =
    ({ params, query, body }) =>
    (req, res, next) => {
        if (params) req.params = parse(params, req.params);
        if (query) req.validatedQuery = parse(query, req.query);
        if (body) req.body = parse(body, req.body ?? {});
        next();
    };

module.exports = validate;
