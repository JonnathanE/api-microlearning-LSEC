const cardService = require('../services/card.service');

exports.getAll = async (req, res) => {
    res.status(200).json(await cardService.list(req.validatedQuery));
};

exports.getById = async (req, res) => {
    res.status(200).json(await cardService.getById(req.params.cardId));
};

exports.create = async (req, res) => {
    res.status(201).json(await cardService.create(req.body, req.files));
};

exports.update = async (req, res) => {
    await cardService.update(req.params.cardId, req.body);
    res.status(200).json({ message: 'La tarjeta de conocimiento se actualizó correctamente' });
};

exports.updateGif = async (req, res) => {
    await cardService.updateGif(req.params.cardId, req.files.gif);
    res.status(200).json({ message: 'GIF actualizado correctamente' });
};

exports.remove = async (req, res) => {
    await cardService.remove(req.params.cardId);
    res.status(204).end();
};
