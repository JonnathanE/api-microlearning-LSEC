const Learn = require('../models/Learn');
const Microlearning = require('../models/Microlearning');
const lessonService = require('./lesson.service');
const media = require('./media.service');
const { NotFoundError } = require('../errors/http-errors');

const findById = async (id) => {
    const microlearning = await Microlearning.findById(id);
    if (!microlearning) throw new NotFoundError('El microcontenido no se encontró o no existe');
    return microlearning;
};

const list = ({ sortBy, order }) =>
    Microlearning.find()
        .populate('lesson')
        .sort([[sortBy, order]]);

const getById = async (id) => (await findById(id)).populate('lesson');

const create = async (data, files) => {
    await lessonService.assertExists(data.lesson);
    const assets = await media.uploadAll({ image: files.image, gif: files.gif });
    return media.saveOrRollback(assets, () =>
        Microlearning.create({ ...data, image_url: assets.image, gif_url: assets.gif }),
    );
};

const update = async (id, data) => {
    const microlearning = await findById(id);
    await lessonService.assertExists(data.lesson);
    Object.assign(microlearning, data);
    return microlearning.save();
};

const updateImage = async (id, file) => media.replaceAsset(await findById(id), 'image_url', file);

const updateGif = async (id, file) => media.replaceAsset(await findById(id), 'gif_url', file);

const remove = async (id) => {
    const microlearning = await findById(id);
    await microlearning.deleteOne();
    await Learn.updateMany({ microlearning: microlearning._id }, { $pull: { microlearning: microlearning._id } });
    await media.removeAll([microlearning.image_url, microlearning.gif_url]);
};

module.exports = { list, getById, create, update, updateImage, updateGif, remove };
