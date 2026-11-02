import type { UploadedFile } from 'express-fileupload';
import { NotFoundError } from '../errors/http-errors.js';
import Card from '../models/Card.js';
import type { CreateCardInput, UpdateCardInput } from '../schemas/card.schema.js';
import type { SortQuery } from '../schemas/common.schema.js';
import * as lessonService from './lesson.service.js';
import * as media from './media.service.js';

const findById = async (id: string) => {
    const card = await Card.findById(id);
    if (!card) throw new NotFoundError('La tarjeta de conocimiento no se encontró o no existe');
    return card;
};

export const list = ({ sortBy, order }: SortQuery) =>
    Card.find()
        .populate('lesson')
        .sort([[sortBy, order]]);

export const getById = async (id: string) => (await findById(id)).populate('lesson');

export const create = async (data: CreateCardInput, gif: UploadedFile) => {
    await lessonService.assertExists(data.lesson);
    const assets = await media.uploadAll({ gif });
    return media.saveOrRollback(assets, () => Card.create({ ...data, gif_url: assets.gif }));
};

export const update = async (id: string, data: UpdateCardInput) => {
    const card = await findById(id);
    await lessonService.assertExists(data.lesson);
    Object.assign(card, data);
    return card.save();
};

export const updateGif = async (id: string, file: UploadedFile) =>
    media.replaceAsset(await findById(id), 'gif_url', file);

export const remove = async (id: string) => {
    const card = await findById(id);
    await card.deleteOne();
    await media.removeAll([card.gif_url]);
};
