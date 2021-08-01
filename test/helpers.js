const Module = require('../src/models/Module');
const User = require('../src/models/User');
const Lesson = require('../src/models/Lesson');

exports.initialModules = [
    {
        number: 1,
        name: "Modulo 1"
    },
    {
        number: 2,
        name: "Modulo 2"
    }
]

exports.student = {
    name: 'Damián',
    email: 'damian@unl.edu.ec',
    password: '123'
}

exports.signInStudent = {
    email: 'damian@unl.edu.ec',
    password: '123'
}

exports.adminUser = {
    "name": "admin",
    "email": "admin@test.com",
    "password": "123",
    "roles": [
        "student",
        "admin",
        "moderator"
    ]
}

exports.singnInAdminUser = {
    "email": "admin@test.com",
    "password": "123",
}