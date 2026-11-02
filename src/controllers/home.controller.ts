import type { Request, Response } from 'express';
import { currentUser } from '../middlewares/auth.js';
import type { PaginationQuery } from '../schemas/common.schema.js';
import * as homeService from '../services/home.service.js';
import type { IdParams } from '../types/http.js';

type LessonParams = IdParams<'lessonId'>;

export const getModules = async (req: Request, res: Response) => {
    res.status(200).json(await homeService.listModules());
};

export const getLessons = async (req: Request<IdParams<'moduleId'>>, res: Response) => {
    res.status(200).json(await homeService.listLessons(req.params.moduleId));
};

export const getMicrolearning = async (req: Request<LessonParams>, res: Response) => {
    const { page } = req.validatedQuery as PaginationQuery;
    res.status(200).json(await homeService.listMicrolearning(req.params.lessonId, page));
};

export const getCards = async (req: Request<LessonParams>, res: Response) => {
    const { page } = req.validatedQuery as PaginationQuery;
    res.status(200).json(await homeService.listCards(req.params.lessonId, page));
};

export const completeLesson = async (req: Request<LessonParams>, res: Response) => {
    await homeService.completeLesson(currentUser(req)._id, req.params.lessonId);
    res.status(200).json({ message: 'Lección completada' });
};

export const getProgress = async (req: Request, res: Response) => {
    res.status(200).json(await homeService.getProgress(currentUser(req)._id));
};
