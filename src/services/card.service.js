const Card = require('../models/Card');
const lessonService = require('./lesson.service');
const media = require('./media.service');
const { NotFoundError } = require('../errors/http-errors');

const findById = async (id) => {
    const card = await Card.findById(id);
    if (!card) throw new NotFoundError('La tarjeta de conocimiento no se encontró o no existe');
    return card;
};

const list = ({ sortBy, order }) =>
    Card.find()
        .populate('lesson')
        .sort([[sortBy, order]]);

const getById = async (id) => (await findById(id)).populate('lesson');

const create = async (data, files) => {
    await lessonService.assertExists(data.lesson);
    const assets = await media.uploadAll({ gif: files.gif });
    return media.saveOrRollback(assets, () => Card.create({ ...data, gif_url: assets.gif }));
};

const update = async (id, data) => {
    const card = await findById(id);
    await lessonService.assertExists(data.lesson);
    Object.assign(card, data);
    return card.save();
};

const updateGif = async (id, file) => media.replaceAsset(await findById(id), 'gif_url', file);

const remove = async (id) => {
    const card = await findById(id);
    await card.deleteOne();
    await media.removeAll([card.gif_url]);
};

module.exports = { list, getById, create, update, updateGif, remove };
