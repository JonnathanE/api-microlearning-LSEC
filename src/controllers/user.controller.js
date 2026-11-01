const userService = require('../services/user.service');

exports.getAll = async (req, res) => {
    res.status(200).json(await userService.list(req.validatedQuery));
};

exports.getById = async (req, res) => {
    res.status(200).json(await userService.getById(req.params.userId));
};

exports.getCurrent = (req, res) => {
    const { name, email, createdAt, updatedAt } = req.user;
    res.status(200).json({ name, email, createdAt, updatedAt });
};

exports.update = async (req, res) => {
    res.status(200).json(await userService.update(req.params.userId, req.body));
};

exports.updateRoles = async (req, res) => {
    res.status(200).json(await userService.updateRoles(req.params.userId, req.body.roles, req.user));
};

exports.remove = async (req, res) => {
    await userService.remove(req.params.userId);
    res.status(204).end();
};
