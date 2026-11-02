import type { UploadedFile } from 'express-fileupload';
import { ConflictError, NotFoundError, ValidationError } from '../errors/http-errors.js';
import Card from '../models/Card.js';
import Learn from '../models/Learn.js';
import Lesson from '../models/Lesson.js';
import Microlearning from '../models/Microlearning.js';
import Module from '../models/Module.js';
import type { SortQuery } from '../schemas/common.schema.js';
import type { CreateLessonInput, UpdateLessonInput } from '../schemas/lesson.schema.js';
import * as media from './media.service.js';

const assertModuleExists = async (id?: string) => {
    if (id && !(await Module.exists({ _id: id }))) {
        throw new ValidationError('El módulo indicado no existe', [{ field: 'module', message: 'No existe' }]);
    }
};

export const assertExists = async (id?: string) => {
    if (id && !(await Lesson.exists({ _id: id }))) {
        throw new ValidationError('La lección indicada no existe', [{ field: 'lesson', message: 'No existe' }]);
    }
};

export const findById = async (id: string) => {
    const lesson = await Lesson.findById(id);
    if (!lesson) throw new NotFoundError('La lección no se encontró o no existe');
    return lesson;
};

export const list = ({ sortBy, order }: SortQuery) =>
    Lesson.find()
        .populate('module')
        .sort([[sortBy, order]]);

export const getById = async (id: string) => (await findById(id)).populate('module');

export const create = async (data: CreateLessonInput, icon: UploadedFile) => {
    await assertModuleExists(data.module);
    const assets = await media.uploadAll({ icon });
    return media.saveOrRollback(assets, () => Lesson.create({ ...data, icon_url: assets.icon }));
};

export const update = async (id: string, data: UpdateLessonInput) => {
    const lesson = await findById(id);
    await assertModuleExists(data.module);
    Object.assign(lesson, data);
    return lesson.save();
};

export const updateIcon = async (id: string, file: UploadedFile) =>
    media.replaceAsset(await findById(id), 'icon_url', file);

export const remove = async (id: string) => {
    const lesson = await findById(id);
    const [hasMicrolearning, hasCard] = await Promise.all([
        Microlearning.exists({ lesson: lesson._id }),
        Card.exists({ lesson: lesson._id }),
    ]);
    if (hasMicrolearning || hasCard) {
        throw new ConflictError('No se puede eliminar una lección que tiene microcontenidos o tarjetas');
    }
    await lesson.deleteOne();
    await Learn.updateMany({ lesson: lesson._id }, { $pull: { lesson: lesson._id } });
    await media.removeAll([lesson.icon_url]);
};
