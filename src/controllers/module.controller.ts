import type { Request, Response } from 'express';
import type { CreateModuleInput, UpdateModuleInput } from '../schemas/module.schema.js';
import * as moduleService from '../services/module.service.js';
import type { IdParams } from '../types/http.js';

type ModuleParams = IdParams<'moduleId'>;

export const getAll = async (req: Request, res: Response) => {
    res.status(200).json(await moduleService.list());
};

export const getById = async (req: Request<ModuleParams>, res: Response) => {
    res.status(200).json(await moduleService.getById(req.params.moduleId));
};

export const create = async (req: Request<object, unknown, CreateModuleInput>, res: Response) => {
    res.status(201).json(await moduleService.create(req.body));
};

export const update = async (req: Request<ModuleParams, unknown, UpdateModuleInput>, res: Response) => {
    await moduleService.update(req.params.moduleId, req.body);
    res.status(200).json({ message: 'Módulo actualizado correctamente' });
};

export const remove = async (req: Request<ModuleParams>, res: Response) => {
    await moduleService.remove(req.params.moduleId);
    res.status(204).end();
};
