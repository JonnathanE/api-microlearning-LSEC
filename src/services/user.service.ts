import { ForbiddenError, NotFoundError } from '../errors/http-errors.js';
import Learn from '../models/Learn.js';
import type { RoleName } from '../models/Role.js';
import User, { type UserDocument } from '../models/User.js';
import type { UpdateUserInput, UserListQuery } from '../schemas/user.schema.js';
import * as roleService from './role.service.js';

export const list = ({ new: onlyNew, limit }: UserListQuery) => {
    const query = User.find().populate('roles');
    return onlyNew ? query.sort({ _id: -1 }).limit(limit) : query;
};

export const getById = async (id: string) => {
    const user = await User.findById(id).populate('roles');
    if (!user) throw new NotFoundError('El usuario no se encontró o no existe');
    return user;
};

export const update = async (id: string, data: UpdateUserInput) => {
    const user = await getById(id);
    Object.assign(user, data);
    return user.save();
};

/**
 * Only another administrator can change the roles of a user, so nobody can raise their own privileges
 */
export const updateRoles = async (id: string, names: RoleName[], actor: UserDocument) => {
    if (actor.id === id) throw new ForbiddenError('No puede cambiar sus propios roles');
    const user = await getById(id);
    user.roles = await roleService.findByNames(names);
    await user.save();
    return getById(id);
};

export const remove = async (id: string) => {
    const user = await getById(id);
    await user.deleteOne();
    await Learn.deleteOne({ user: user._id });
};
