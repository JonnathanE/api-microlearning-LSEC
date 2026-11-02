import type { Request, Response } from 'express';
import { currentUser } from '../middlewares/auth.js';
import type { UpdateRolesInput, UpdateUserInput, UserListQuery } from '../schemas/user.schema.js';
import * as userService from '../services/user.service.js';
import type { IdParams } from '../types/http.js';

type UserParams = IdParams<'userId'>;

export const getAll = async (req: Request, res: Response) => {
    res.status(200).json(await userService.list(req.validatedQuery as UserListQuery));
};

export const getById = async (req: Request<UserParams>, res: Response) => {
    res.status(200).json(await userService.getById(req.params.userId));
};

export const getCurrent = (req: Request, res: Response) => {
    const { name, email, createdAt, updatedAt } = currentUser(req);
    res.status(200).json({ name, email, createdAt, updatedAt });
};

export const update = async (req: Request<UserParams, unknown, UpdateUserInput>, res: Response) => {
    res.status(200).json(await userService.update(req.params.userId, req.body));
};

export const updateRoles = async (req: Request<UserParams, unknown, UpdateRolesInput>, res: Response) => {
    res.status(200).json(await userService.updateRoles(req.params.userId, req.body.roles, currentUser(req)));
};

export const remove = async (req: Request<UserParams>, res: Response) => {
    await userService.remove(req.params.userId);
    res.status(204).end();
};
