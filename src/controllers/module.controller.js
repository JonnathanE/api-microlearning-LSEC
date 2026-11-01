const moduleService = require('../services/module.service');

exports.getAll = async (req, res) => {
    res.status(200).json(await moduleService.list());
};

exports.getById = async (req, res) => {
    res.status(200).json(await moduleService.getById(req.params.moduleId));
};

exports.create = async (req, res) => {
    res.status(201).json(await moduleService.create(req.body));
};

exports.update = async (req, res) => {
    await moduleService.update(req.params.moduleId, req.body);
    res.status(200).json({ message: 'Módulo actualizado correctamente' });
};

exports.remove = async (req, res) => {
    await moduleService.remove(req.params.moduleId);
    res.status(204).end();
};
