import type { UploadedFile } from 'express-fileupload';
import { NotFoundError } from '../errors/http-errors.js';
import Learn from '../models/Learn.js';
import Microlearning from '../models/Microlearning.js';
import type { SortQuery } from '../schemas/common.schema.js';
import type { CreateMicrolearningInput, UpdateMicrolearningInput } from '../schemas/microlearning.schema.js';
import * as lessonService from './lesson.service.js';
import * as media from './media.service.js';

const findById = async (id: string) => {
    const microlearning = await Microlearning.findById(id);
    if (!microlearning) throw new NotFoundError('El microcontenido no se encontró o no existe');
    return microlearning;
};

export const list = ({ sortBy, order }: SortQuery) =>
    Microlearning.find()
        .populate('lesson')
        .sort([[sortBy, order]]);

export const getById = async (id: string) => (await findById(id)).populate('lesson');

export const create = async (data: CreateMicrolearningInput, image: UploadedFile, gif: UploadedFile) => {
    await lessonService.assertExists(data.lesson);
    const assets = await media.uploadAll({ image, gif });
    return media.saveOrRollback(assets, () =>
        Microlearning.create({ ...data, image_url: assets.image, gif_url: assets.gif }),
    );
};

export const update = async (id: string, data: UpdateMicrolearningInput) => {
    const microlearning = await findById(id);
    await lessonService.assertExists(data.lesson);
    Object.assign(microlearning, data);
    return microlearning.save();
};

export const updateImage = async (id: string, file: UploadedFile) =>
    media.replaceAsset(await findById(id), 'image_url', file);

export const updateGif = async (id: string, file: UploadedFile) =>
    media.replaceAsset(await findById(id), 'gif_url', file);

export const remove = async (id: string) => {
    const microlearning = await findById(id);
    await microlearning.deleteOne();
    await Learn.updateMany({ microlearning: microlearning._id }, { $pull: { microlearning: microlearning._id } });
    await media.removeAll([microlearning.image_url, microlearning.gif_url]);
};
