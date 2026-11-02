import type { Request, Response } from 'express';
import Card from '../models/Card.js';
import Learn from '../models/Learn.js';
import Lesson from '../models/Lesson.js';
import Microlearning from '../models/Microlearning.js';
import Module from '../models/Module.js';
import User from '../models/User.js';

export const reset = async (req: Request, res: Response) => {
    await Promise.all([
        Learn.deleteMany({}),
        User.deleteMany({}),
        Module.deleteMany({}),
        Lesson.deleteMany({}),
        Microlearning.deleteMany({}),
        Card.deleteMany({}),
    ]);
    res.status(204).end();
};
