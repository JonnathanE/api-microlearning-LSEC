import type { PaginateModel, Types } from 'mongoose';
import { NotFoundError } from '../errors/http-errors.js';
import Card from '../models/Card.js';
import Learn from '../models/Learn.js';
import Lesson from '../models/Lesson.js';
import Microlearning from '../models/Microlearning.js';
import Module from '../models/Module.js';
import * as lessonService from './lesson.service.js';
import * as moduleService from './module.service.js';

// the frontend shows the content of a lesson one item at a time
const ITEMS_PER_PAGE = 1;

const paginateByLesson = async <T>(model: PaginateModel<T>, lessonId: Types.ObjectId, page: number) => {
    const result = await model.paginate({ lesson: lessonId }, { limit: ITEMS_PER_PAGE, page });
    if (result.totalDocs === 0) throw new NotFoundError('No se ha registrado contenido para esta lección');
    return result;
};

const listContent = async <T>(model: PaginateModel<T>, lessonId: string, page?: number) => {
    const lesson = await lessonService.findById(lessonId);
    return page ? paginateByLesson(model, lesson._id, page) : model.find({ lesson: lesson._id });
};

/** Returns the modules that have lessons */
export const listModules = async () => {
    const moduleIds = await Lesson.distinct('module');
    return Module.find({ _id: { $in: moduleIds } }).sort({ number: 1 });
};

export const listLessons = async (moduleId: string) => {
    const module = await moduleService.getById(moduleId);
    return Lesson.find({ module: module._id });
};

export const listMicrolearning = (lessonId: string, page?: number) => listContent(Microlearning, lessonId, page);

export const listCards = (lessonId: string, page?: number) => listContent(Card, lessonId, page);

export const completeLesson = async (userId: Types.ObjectId, lessonId: string) => {
    const lesson = await lessonService.findById(lessonId);
    await Learn.updateOne({ user: userId }, { $addToSet: { lesson: lesson._id } }, { upsert: true });
};

export const getProgress = (userId: Types.ObjectId) =>
    Learn.findOneAndUpdate({ user: userId }, {}, { upsert: true, returnDocument: 'after' });
