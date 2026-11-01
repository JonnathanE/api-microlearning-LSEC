const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../models/User');
const { ForbiddenError, UnauthorizedError } = require('../errors/http-errors');

const BEARER_TOKEN = /^Bearer (\S+)$/;

/**
 * Checks the token of the request and stores the user with their roles in req.user
 */
const authenticate = async (req, res, next) => {
    const header = req.headers.authorization;
    if (!header) throw new UnauthorizedError('No se proporcionó token');
    const token = header.match(BEARER_TOKEN)?.[1];
    if (!token) throw new UnauthorizedError();

    let payload;
    try {
        payload = jwt.verify(token, env.JWT_SECRET, { algorithms: ['HS256'] });
    } catch {
        throw new UnauthorizedError();
    }
    const user = await User.findById(payload._id).populate('roles');
    if (!user) throw new UnauthorizedError();

    req.user = user;
    next();
};

const requireAdmin = (req, res, next) => {
    if (!req.user.hasRole('admin')) throw new ForbiddenError('Requiere rol de administrador');
    next();
};

/**
 * Only the user identified by :userId or an administrator can continue
 */
const requireSelfOrAdmin = (req, res, next) => {
    if (req.user.id !== req.params.userId && !req.user.hasRole('admin')) {
        throw new ForbiddenError('No tiene permisos sobre este usuario');
    }
    next();
};

module.exports = { authenticate, requireAdmin, requireSelfOrAdmin };
