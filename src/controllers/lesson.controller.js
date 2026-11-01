const lessonService = require('../services/lesson.service');
const { NotFoundError } = require('../errors/http-errors');

exports.getAll = async (req, res) => {
    res.status(200).json(await lessonService.list(req.validatedQuery));
};

exports.getById = async (req, res) => {
    res.status(200).json(await lessonService.getById(req.params.lessonId));
};

exports.create = async (req, res) => {
    res.status(201).json(await lessonService.create(req.body, req.files));
};

exports.update = async (req, res) => {
    await lessonService.update(req.params.lessonId, req.body);
    res.status(200).json({ message: 'Lección actualizada correctamente' });
};

exports.remove = async (req, res) => {
    await lessonService.remove(req.params.lessonId);
    res.status(204).end();
};

exports.getIcon = async (req, res) => {
    const { icon_url: icon } = await lessonService.findById(req.params.lessonId);
    if (!icon?.url) throw new NotFoundError('La lección no tiene ícono');
    res.redirect(302, icon.url);
};

exports.updateIcon = async (req, res) => {
    await lessonService.updateIcon(req.params.lessonId, req.files.icon);
    res.status(200).json({ message: 'Ícono actualizado correctamente' });
};
