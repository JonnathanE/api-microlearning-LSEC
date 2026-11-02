import type { Request } from 'express';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import env from '../config/env.js';
import { ForbiddenError, UnauthorizedError } from '../errors/http-errors.js';
import User from '../models/User.js';
import type { AnyRequestHandler } from '../types/http.js';

const BEARER_TOKEN = /^Bearer (\S+)$/;

/**
 * Returns the authenticated user. It can only be used after the authenticate middleware.
 */
export const currentUser = (req: Pick<Request, 'user'>) => {
    if (!req.user) throw new UnauthorizedError();
    return req.user;
};

/**
 * Checks the token of the request and stores the user with their roles in req.user
 */
export const authenticate: AnyRequestHandler = async (req, res, next) => {
    const header = req.headers.authorization;
    if (!header) throw new UnauthorizedError('No se proporcionó token');
    const token = header.match(BEARER_TOKEN)?.[1];
    if (!token) throw new UnauthorizedError();

    let payload: JwtPayload;
    try {
        payload = jwt.verify(token, env.JWT_SECRET, { algorithms: ['HS256'] }) as JwtPayload;
    } catch {
        throw new UnauthorizedError();
    }
    const user = await User.findById(payload._id).populate('roles');
    if (!user) throw new UnauthorizedError();

    req.user = user;
    next();
};

export const requireAdmin: AnyRequestHandler = (req, res, next) => {
    if (!currentUser(req).hasRole('admin')) throw new ForbiddenError('Requiere rol de administrador');
    next();
};

/**
 * Only the user identified by :userId or an administrator can continue
 */
export const requireSelfOrAdmin: AnyRequestHandler = (req, res, next) => {
    const user = currentUser(req);
    if (user.id !== req.params.userId && !user.hasRole('admin')) {
        throw new ForbiddenError('No tiene permisos sobre este usuario');
    }
    next();
};
