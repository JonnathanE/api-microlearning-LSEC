import { ConflictError, NotFoundError } from '../errors/http-errors.js';
import Lesson from '../models/Lesson.js';
import Module from '../models/Module.js';
import type { CreateModuleInput, UpdateModuleInput } from '../schemas/module.schema.js';

export const list = () => Module.find().sort({ number: 1 });

export const getById = async (id: string) => {
    const module = await Module.findById(id);
    if (!module) throw new NotFoundError('El módulo no se encontró o no existe');
    return module;
};

export const create = (data: CreateModuleInput) => Module.create(data);

export const update = async (id: string, data: UpdateModuleInput) => {
    const module = await getById(id);
    Object.assign(module, data);
    return module.save();
};

export const remove = async (id: string) => {
    const module = await getById(id);
    if (await Lesson.exists({ module: module._id })) {
        throw new ConflictError('No se puede eliminar un módulo que tiene lecciones');
    }
    await module.deleteOne();
};
