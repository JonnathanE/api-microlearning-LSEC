const Role = require('../src/models/Role');
const User = require('../src/models/User');

exports.student = {
    name: 'Damián',
    email: 'damian@unl.edu.ec',
    password: 'password1234',
};

exports.adminUser = {
    name: 'admin',
    email: 'admin@test.com',
    password: 'password1234',
};

exports.signInStudent = {
    email: 'damian@unl.edu.ec',
    password: 'password1234',
};

exports.singnInAdminUser = {
    email: 'admin@test.com',
    password: 'password1234',
};

exports.singleModule = {
    number: 3,
    name: 'Modulo 3',
};

exports.initialModules = [
    {
        number: 1,
        name: 'Modulo 1',
    },
    {
        number: 2,
        name: 'Modulo 2',
    },
];

// admins cannot be created through the public signup
exports.createAdmin = async () => {
    const roles = await Role.find();
    return User.create({ ...exports.adminUser, roles });
};
