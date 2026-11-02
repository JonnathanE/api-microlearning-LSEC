import type { Request, Response } from 'express';
import { NotFoundError } from '../errors/http-errors.js';
import { uploadedFile } from '../middlewares/upload.js';
import type { SortQuery } from '../schemas/common.schema.js';
import type { CreateLessonInput, UpdateLessonInput } from '../schemas/lesson.schema.js';
import * as lessonService from '../services/lesson.service.js';
import type { IdParams } from '../types/http.js';

type LessonParams = IdParams<'lessonId'>;

export const getAll = async (req: Request, res: Response) => {
    res.status(200).json(await lessonService.list(req.validatedQuery as SortQuery));
};

export const getById = async (req: Request<LessonParams>, res: Response) => {
    res.status(200).json(await lessonService.getById(req.params.lessonId));
};

export const create = async (req: Request<object, unknown, CreateLessonInput>, res: Response) => {
    res.status(201).json(await lessonService.create(req.body, uploadedFile(req, 'icon')));
};

export const update = async (req: Request<LessonParams, unknown, UpdateLessonInput>, res: Response) => {
    await lessonService.update(req.params.lessonId, req.body);
    res.status(200).json({ message: 'Lección actualizada correctamente' });
};

export const remove = async (req: Request<LessonParams>, res: Response) => {
    await lessonService.remove(req.params.lessonId);
    res.status(204).end();
};

export const getIcon = async (req: Request<LessonParams>, res: Response) => {
    const { icon_url: icon } = await lessonService.findById(req.params.lessonId);
    if (!icon?.url) throw new NotFoundError('La lección no tiene ícono');
    res.redirect(302, icon.url);
};

export const updateIcon = async (req: Request<LessonParams>, res: Response) => {
    await lessonService.updateIcon(req.params.lessonId, uploadedFile(req, 'icon'));
    res.status(200).json({ message: 'Ícono actualizado correctamente' });
};
