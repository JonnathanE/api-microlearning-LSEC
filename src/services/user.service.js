const Learn = require('../models/Learn');
const User = require('../models/User');
const roleService = require('./role.service');
const { ForbiddenError, NotFoundError } = require('../errors/http-errors');

const list = ({ new: onlyNew, limit }) => {
    const query = User.find().populate('roles');
    return onlyNew ? query.sort({ _id: -1 }).limit(limit) : query;
};

const getById = async (id) => {
    const user = await User.findById(id).populate('roles');
    if (!user) throw new NotFoundError('El usuario no se encontró o no existe');
    return user;
};

const update = async (id, data) => {
    const user = await getById(id);
    Object.assign(user, data);
    return user.save();
};

/**
 * Only another administrator can change the roles of a user, so nobody can raise their own privileges
 */
const updateRoles = async (id, names, actor) => {
    if (actor.id === id) throw new ForbiddenError('No puede cambiar sus propios roles');
    const user = await getById(id);
    user.roles = await roleService.findByNames(names);
    await user.save();
    return getById(id);
};

const remove = async (id) => {
    const user = await getById(id);
    await user.deleteOne();
    await Learn.deleteOne({ user: user._id });
};

module.exports = { list, getById, update, updateRoles, remove };
