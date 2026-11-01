const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const mongoose = require('mongoose');
const pinoHttp = require('pino-http');
const swaggerUi = require('swagger-ui-express');
const env = require('./config/env');
const openapi = require('./docs/openapi');
const logger = require('./libs/logger');
const { notFound, errorHandler } = require('./middlewares/error-handler');

const app = express();

// Middlewares
// images are served to the frontend from another origin
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(pinoHttp({ logger, autoLogging: { ignore: (req) => req.url === '/health' } }));
app.use(cors({ origin: env.CORS_ORIGINS }));
app.use(express.json());

// Routes
app.get('/', (req, res) => {
    res.send('Hola desde el servidor proyecto Microlearning LSEC');
});
app.get('/health', (req, res) => {
    const healthy = mongoose.connection.readyState === mongoose.ConnectionStates.connected;
    res.status(healthy ? 200 : 503).json({ status: healthy ? 'ok' : 'unavailable' });
});
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapi));
app.use('/api/user', require('./routes/user.routes'));
app.use('/api/module', require('./routes/module.routes'));
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/lesson', require('./routes/lesson.routes'));
app.use('/api/micro', require('./routes/microlearning.routes'));
app.use('/api/home', require('./routes/home.routes'));
app.use('/api/card', require('./routes/card.routes'));
if (env.NODE_ENV === 'test') {
    app.use('/api/testing', require('./routes/test.routes'));
}

// Errors
app.use(notFound);
app.use(errorHandler);

module.exports = app;
