import type { Request, Response } from 'express';
import { uploadedFile } from '../middlewares/upload.js';
import type { CreateCardInput, UpdateCardInput } from '../schemas/card.schema.js';
import type { SortQuery } from '../schemas/common.schema.js';
import * as cardService from '../services/card.service.js';
import type { IdParams } from '../types/http.js';

type CardParams = IdParams<'cardId'>;

export const getAll = async (req: Request, res: Response) => {
    res.status(200).json(await cardService.list(req.validatedQuery as SortQuery));
};

export const getById = async (req: Request<CardParams>, res: Response) => {
    res.status(200).json(await cardService.getById(req.params.cardId));
};

export const create = async (req: Request<object, unknown, CreateCardInput>, res: Response) => {
    res.status(201).json(await cardService.create(req.body, uploadedFile(req, 'gif')));
};

export const update = async (req: Request<CardParams, unknown, UpdateCardInput>, res: Response) => {
    await cardService.update(req.params.cardId, req.body);
    res.status(200).json({ message: 'La tarjeta de conocimiento se actualizó correctamente' });
};

export const updateGif = async (req: Request<CardParams>, res: Response) => {
    await cardService.updateGif(req.params.cardId, uploadedFile(req, 'gif'));
    res.status(200).json({ message: 'GIF actualizado correctamente' });
};

export const remove = async (req: Request<CardParams>, res: Response) => {
    await cardService.remove(req.params.cardId);
    res.status(204).end();
};
