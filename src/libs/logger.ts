import { pino } from 'pino';
import env from '../config/env.js';

export default pino({
    level: env.logLevel,
    // tokens must never reach the logs
    redact: ['req.headers.authorization', 'req.headers.cookie'],
    transport: env.NODE_ENV === 'development' ? { target: 'pino-pretty' } : undefined,
});
