import type { Request, Response } from 'express';
import { uploadedFile } from '../middlewares/upload.js';
import type { SortQuery } from '../schemas/common.schema.js';
import type { CreateMicrolearningInput, UpdateMicrolearningInput } from '../schemas/microlearning.schema.js';
import * as microlearningService from '../services/microlearning.service.js';
import type { IdParams } from '../types/http.js';

type MicroParams = IdParams<'microId'>;

export const getAll = async (req: Request, res: Response) => {
    res.status(200).json(await microlearningService.list(req.validatedQuery as SortQuery));
};

export const getById = async (req: Request<MicroParams>, res: Response) => {
    res.status(200).json(await microlearningService.getById(req.params.microId));
};

export const create = async (req: Request<object, unknown, CreateMicrolearningInput>, res: Response) => {
    const microlearning = await microlearningService.create(
        req.body,
        uploadedFile(req, 'image'),
        uploadedFile(req, 'gif'),
    );
    res.status(201).json(microlearning);
};

export const update = async (req: Request<MicroParams, unknown, UpdateMicrolearningInput>, res: Response) => {
    await microlearningService.update(req.params.microId, req.body);
    res.status(200).json({ message: 'El microcontenido se actualizó correctamente' });
};

export const updateImage = async (req: Request<MicroParams>, res: Response) => {
    await microlearningService.updateImage(req.params.microId, uploadedFile(req, 'image'));
    res.status(200).json({ message: 'Imagen actualizada correctamente' });
};

export const updateGif = async (req: Request<MicroParams>, res: Response) => {
    await microlearningService.updateGif(req.params.microId, uploadedFile(req, 'gif'));
    res.status(200).json({ message: 'GIF actualizado correctamente' });
};

export const remove = async (req: Request<MicroParams>, res: Response) => {
    await microlearningService.remove(req.params.microId);
    res.status(204).end();
};
