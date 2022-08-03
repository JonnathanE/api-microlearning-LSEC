const Module = require('../src/models/Module');
const User = require('../src/models/User');
const Lesson = require('../src/models/Lesson');

exports.student = {
    name: 'Damián',
    email: 'damian@unl.edu.ec',
    password: '1234'
}

exports.adminUser = {
    "name": "admin",
    "email": "admin@test.com",
    "password": "1234",
    "roles": [
        "student",
        "admin",
        "moderator"
    ]
}

exports.signInStudent = {
    email: 'damian@unl.edu.ec',
    password: '1234'
}

exports.singnInAdminUser = {
    "email": "admin@test.com",
    "password": "1234",
}

exports.singleModule = {
    number: 3,
    name: "Modulo 3"
}

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