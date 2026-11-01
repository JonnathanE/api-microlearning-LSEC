const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../models/User');
const roleService = require('./role.service');
const { ConflictError, ForbiddenError, UnauthorizedError } = require('../errors/http-errors');

const TOKEN_LIFETIME_SECONDS = 24 * 60 * 60;

const createToken = (user) =>
    jwt.sign({ _id: user._id }, env.JWT_SECRET, { algorithm: 'HS256', expiresIn: TOKEN_LIFETIME_SECONDS });

const session = (user) => ({ token: createToken(user), name: user.name, email: user.email });

/**
 * Registers a student. The roles can only be changed later by an administrator.
 */
const signup = async ({ name, email, password }) => {
    if (await User.exists({ email })) throw new ConflictError('El correo electrónico ya existe');
    const roles = await roleService.findByNames(['student']);
    const user = await User.create({ name, email, password, roles });
    return session(user);
};

/**
 * The same error is returned for an unknown email and a wrong password so registered emails are not revealed
 */
const authenticate = async ({ email, password }) => {
    const user = await User.findOne({ email }).select('+password').populate('roles');
    if (!user || !(await user.verifyPassword(password))) {
        throw new UnauthorizedError('El correo electrónico o la contraseña no coinciden');
    }
    return user;
};

const signin = async (credentials) => session(await authenticate(credentials));

const signinAdmin = async (credentials) => {
    const user = await authenticate(credentials);
    if (!user.hasRole('admin')) throw new ForbiddenError('No tiene los permisos para ingresar a la página');
    return { ...session(user), role: ['admin'] };
};

module.exports = { signup, signin, signinAdmin };
