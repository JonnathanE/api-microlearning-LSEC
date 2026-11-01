const app = require('./app');
const env = require('./config/env');
const { connectDatabase, disconnectDatabase } = require('./config/database');
const logger = require('./libs/logger');
const roleService = require('./services/role.service');

const SHUTDOWN_TIMEOUT_MS = 10000;

const start = async () => {
    await connectDatabase();
    await roleService.ensureRoles();

    const server = app.listen(env.PORT, () => {
        logger.info({ port: env.PORT }, 'Server started');
    });

    const shutdown = async (signal) => {
        logger.info({ signal }, 'Shutting down');
        // force the exit if a connection keeps the server open
        setTimeout(() => process.exit(1), SHUTDOWN_TIMEOUT_MS).unref();
        server.close(async () => {
            await disconnectDatabase();
            process.exit(0);
        });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
};

start().catch((err) => {
    logger.fatal({ err }, 'Could not start the server');
    process.exit(1);
});
