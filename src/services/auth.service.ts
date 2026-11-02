import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import { ConflictError, ForbiddenError, UnauthorizedError } from '../errors/http-errors.js';
import User, { type UserDocument } from '../models/User.js';
import type { SigninInput, SignupInput } from '../schemas/auth.schema.js';
import * as roleService from './role.service.js';

const TOKEN_LIFETIME_SECONDS = 24 * 60 * 60;

const createToken = (user: UserDocument) =>
    jwt.sign({ _id: user._id }, env.JWT_SECRET, { algorithm: 'HS256', expiresIn: TOKEN_LIFETIME_SECONDS });

const session = (user: UserDocument) => ({ token: createToken(user), name: user.name, email: user.email });

/**
 * Registers a student. The roles can only be changed later by an administrator.
 */
export const signup = async ({ name, email, password }: SignupInput) => {
    if (await User.exists({ email })) throw new ConflictError('El correo electrónico ya existe');
    const roles = await roleService.findByNames(['student']);
    const user = await User.create({ name, email, password, roles });
    return session(user);
};

/**
 * The same error is returned for an unknown email and a wrong password so registered emails are not revealed
 */
const authenticate = async ({ email, password }: SigninInput) => {
    const user = await User.findOne({ email }).select('+password').populate('roles');
    if (!user || !(await user.verifyPassword(password))) {
        throw new UnauthorizedError('El correo electrónico o la contraseña no coinciden');
    }
    return user;
};

export const signin = async (credentials: SigninInput) => session(await authenticate(credentials));

export const signinAdmin = async (credentials: SigninInput) => {
    const user = await authenticate(credentials);
    if (!user.hasRole('admin')) throw new ForbiddenError('No tiene los permisos para ingresar a la página');
    return { ...session(user), role: ['admin'] };
};
