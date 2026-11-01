const mongoose = require('mongoose');
const env = require('./env');
const logger = require('../libs/logger');

const connectDatabase = async () => {
    const { connection } = await mongoose.connect(env.databaseUrl);
    logger.info({ database: connection.name }, 'Database connected');
};

const disconnectDatabase = () => mongoose.disconnect();

module.exports = { connectDatabase, disconnectDatabase };
