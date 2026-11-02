import mongoose from 'mongoose';
import logger from '../libs/logger.js';
import env from './env.js';

export const connectDatabase = async () => {
    const { connection } = await mongoose.connect(env.databaseUrl);
    logger.info({ database: connection.name }, 'Database connected');
};

export const disconnectDatabase = () => mongoose.disconnect();
