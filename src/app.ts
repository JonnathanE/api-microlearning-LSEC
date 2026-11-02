import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import mongoose from 'mongoose';
import { pinoHttp } from 'pino-http';
import swaggerUi from 'swagger-ui-express';
import env from './config/env.js';
import openapi from './docs/openapi.js';
import logger from './libs/logger.js';
import { errorHandler, notFound } from './middlewares/error-handler.js';
import authRoutes from './routes/auth.routes.js';
import cardRoutes from './routes/card.routes.js';
import homeRoutes from './routes/home.routes.js';
import lessonRoutes from './routes/lesson.routes.js';
import microlearningRoutes from './routes/microlearning.routes.js';
import moduleRoutes from './routes/module.routes.js';
import testRoutes from './routes/test.routes.js';
import userRoutes from './routes/user.routes.js';

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
app.use('/api/user', userRoutes);
app.use('/api/module', moduleRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/lesson', lessonRoutes);
app.use('/api/micro', microlearningRoutes);
app.use('/api/home', homeRoutes);
app.use('/api/card', cardRoutes);
if (env.NODE_ENV === 'test') {
    app.use('/api/testing', testRoutes);
}

// Errors
app.use(notFound);
app.use(errorHandler);

export default app;
