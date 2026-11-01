const { rateLimit } = require('express-rate-limit');
const env = require('../config/env');

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    skip: () => env.NODE_ENV === 'test',
    message: { error: 'Demasiados intentos. Intente de nuevo más tarde', code: 'TOO_MANY_REQUESTS' },
});

module.exports = { authLimiter };
