import type { Request, Response } from 'express';
import type { SigninInput, SignupInput } from '../schemas/auth.schema.js';
import * as authService from '../services/auth.service.js';

export const signup = async (req: Request<object, unknown, SignupInput>, res: Response) => {
    res.status(201).json(await authService.signup(req.body));
};

export const signin = async (req: Request<object, unknown, SigninInput>, res: Response) => {
    res.status(200).json(await authService.signin(req.body));
};

export const signinAdmin = async (req: Request<object, unknown, SigninInput>, res: Response) => {
    res.status(200).json(await authService.signinAdmin(req.body));
};
