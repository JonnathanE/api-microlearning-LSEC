const microlearningService = require('../services/microlearning.service');

exports.getAll = async (req, res) => {
    res.status(200).json(await microlearningService.list(req.validatedQuery));
};

exports.getById = async (req, res) => {
    res.status(200).json(await microlearningService.getById(req.params.microId));
};

exports.create = async (req, res) => {
    res.status(201).json(await microlearningService.create(req.body, req.files));
};

exports.update = async (req, res) => {
    await microlearningService.update(req.params.microId, req.body);
    res.status(200).json({ message: 'El microcontenido se actualizó correctamente' });
};

exports.updateImage = async (req, res) => {
    await microlearningService.updateImage(req.params.microId, req.files.image);
    res.status(200).json({ message: 'Imagen actualizada correctamente' });
};

exports.updateGif = async (req, res) => {
    await microlearningService.updateGif(req.params.microId, req.files.gif);
    res.status(200).json({ message: 'GIF actualizado correctamente' });
};

exports.remove = async (req, res) => {
    await microlearningService.remove(req.params.microId);
    res.status(204).end();
};
