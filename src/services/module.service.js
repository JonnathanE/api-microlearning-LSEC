const Lesson = require('../models/Lesson');
const Module = require('../models/Module');
const { ConflictError, NotFoundError } = require('../errors/http-errors');

const list = () => Module.find().sort({ number: 1 });

const getById = async (id) => {
    const module = await Module.findById(id);
    if (!module) throw new NotFoundError('El módulo no se encontró o no existe');
    return module;
};

const create = (data) => Module.create(data);

const update = async (id, data) => {
    const module = await getById(id);
    Object.assign(module, data);
    return module.save();
};

const remove = async (id) => {
    const module = await getById(id);
    if (await Lesson.exists({ module: module._id })) {
        throw new ConflictError('No se puede eliminar un módulo que tiene lecciones');
    }
    await module.deleteOne();
};

module.exports = { list, getById, create, update, remove };
