const pino = require('pino');
const env = require('../config/env');

module.exports = pino({
    level: env.logLevel,
    // tokens must never reach the logs
    redact: ['req.headers.authorization', 'req.headers.cookie'],
    transport: env.NODE_ENV === 'development' ? { target: 'pino-pretty' } : undefined,
});
