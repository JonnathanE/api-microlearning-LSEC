const Card = require('../models/Card');
const Learn = require('../models/Learn');
const Lesson = require('../models/Lesson');
const Microlearning = require('../models/Microlearning');
const Module = require('../models/Module');
const media = require('./media.service');
const { ConflictError, NotFoundError, ValidationError } = require('../errors/http-errors');

const assertModuleExists = async (id) => {
    if (id && !(await Module.exists({ _id: id }))) {
        throw new ValidationError('El módulo indicado no existe', [{ field: 'module', message: 'No existe' }]);
    }
};

const assertExists = async (id) => {
    if (id && !(await Lesson.exists({ _id: id }))) {
        throw new ValidationError('La lección indicada no existe', [{ field: 'lesson', message: 'No existe' }]);
    }
};

const findById = async (id) => {
    const lesson = await Lesson.findById(id);
    if (!lesson) throw new NotFoundError('La lección no se encontró o no existe');
    return lesson;
};

const list = ({ sortBy, order }) =>
    Lesson.find()
        .populate('module')
        .sort([[sortBy, order]]);

const getById = async (id) => (await findById(id)).populate('module');

const create = async (data, files) => {
    await assertModuleExists(data.module);
    const assets = await media.uploadAll({ icon: files.icon });
    return media.saveOrRollback(assets, () => Lesson.create({ ...data, icon_url: assets.icon }));
};

const update = async (id, data) => {
    const lesson = await findById(id);
    await assertModuleExists(data.module);
    Object.assign(lesson, data);
    return lesson.save();
};

const updateIcon = async (id, file) => media.replaceAsset(await findById(id), 'icon_url', file);

const remove = async (id) => {
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

module.exports = { assertExists, list, getById, findById, create, update, updateIcon, remove };
