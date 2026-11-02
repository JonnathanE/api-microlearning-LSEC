import Role from '../src/models/Role.js';
import User from '../src/models/User.js';

export const student = {
    name: 'Damián',
    email: 'damian@unl.edu.ec',
    password: 'password1234',
};

export const adminUser = {
    name: 'admin',
    email: 'admin@test.com',
    password: 'password1234',
};

export const signInStudent = {
    email: 'damian@unl.edu.ec',
    password: 'password1234',
};

export const singnInAdminUser = {
    email: 'admin@test.com',
    password: 'password1234',
};

export const singleModule = {
    number: 3,
    name: 'Modulo 3',
};

export const initialModules = [
    {
        number: 1,
        name: 'Modulo 1',
    },
    {
        number: 2,
        name: 'Modulo 2',
    },
] as const;

// admins cannot be created through the public signup
export const createAdmin = async () => {
    const roles = await Role.find();
    return User.create({ ...adminUser, roles });
};
