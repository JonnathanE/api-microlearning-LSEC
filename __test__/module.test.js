const mongoose = require('mongoose');
const supertest = require('supertest');
const { app, server } = require('../src/index');

const Module = require('../src/models/Module');
const User = require('../src/models/User');

const { initialModules, student, signInStudent, adminUser, singnInAdminUser } = require('./helpers');

const api = supertest(app);

beforeEach(async () => {
    await Module.deleteMany({});

    for (const module of initialModules) {
        const moduleObject = new Module(module);
        await moduleObject.save();
    }
});

describe('POST /api/auth/signup', () => {

    test('create a student', async () => {
        await api
            .post('/api/auth/signup')
            .send(student)
            .expect(200)
            .expect('Content-Type', /application\/json/)
        const response = await User.findOne({ email: student.email });
        expect(response.email).toBe(student.email);
    });

    test('a student with the same email cannot be created', async () => {
        const newEstudent = {
            name: 'Kevin',
            email: 'damian@unl.edu.ec',
            password: '123'
        }
        await api
            .post('/api/auth/signup')
            .send(newEstudent)
            .expect(400)
            .expect('Content-Type', /application\/json/)
        const response = await User.find({ email: student.email });
        expect(response.length).toBe(1);
    })

    test('a student cannot create an account if he does not submit all parameters', async () => {
        const newEstudent = {
            name: 'Jonnathan',
            email: 'jonnathan@unl.edu.ec',
        }
        await api
            .post('/api/auth/signup')
            .send(newEstudent)
            .expect(400)
            .expect('Content-Type', /application\/json/)
        const response = await User.find({ email: student.email });
        expect(response.length).toBe(1);
    })

    test('create a admin', async () => {
        await api
            .post('/api/auth/signup')
            .send(adminUser)
            .expect(200)
            .expect('Content-Type', /application\/json/)
        const response = await User.findOne({ email: student.email });
        expect(response.email).toBe(student.email);
    });
});

describe('POST /api/auth/signin', () => {

    test('student login', async () => {
        const response = await api
            .post('/api/auth/signin')
            .send(signInStudent)
            .expect(200)
            .expect('Content-Type', /application\/json/)

        expect(response.body.user.email).toBe(signInStudent.email);
    });

    test('the student cannot enter with a different email address', async () => {
        const newSignInStudent = {
            email: 'diferent@unl.edu.ec',
            password: '123'
        }
        const response = await api
            .post('/api/auth/signin')
            .send(newSignInStudent)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        expect(response.body.error).toBe('El usuario con ese correo electrónico no existe');
    });

    test('student cannot login with wrong password', async () => {
        const newSignInStudent = {
            email: 'damian@unl.edu.ec',
            password: '1234'
        }
        const response = await api
            .post('/api/auth/signin')
            .send(newSignInStudent)
            .expect(401)
            .expect('Content-Type', /application\/json/)

        expect(response.body.error).toBe('El correo electrónico y la contraseña no coinciden');
    });
});

describe('POST /api/module', () => {

    test('create a module with an authenticated admin', async () => {
        const adminLogin = await api
            .post('/api/auth/signin')
            .send(singnInAdminUser)
            .expect(200)
            .expect('Content-Type', /application\/json/)
        expect(adminLogin.body.user.email).toBe(singnInAdminUser.email);
        const newModule = {
            number: 3,
            name: "Modulo 3"
        };
        const response = await api
            .post('/api/module/')
            .send(newModule)
            .set('authorization', `Bearer ${adminLogin.body.token}`)
            .expect('Content-Type', /application\/json/)
            .expect(200)
        expect(response.body.data.name).toBe(newModule.name);
        const allModules = await api.get('/api/module');
        expect(allModules.body).toHaveLength(initialModules.length + 1);
    });

    test('a user without permission cannot create a module', async () => {
        const adminLogin = await api
            .post('/api/auth/signin')
            .send(signInStudent)
            .expect(200)
            .expect('Content-Type', /application\/json/)
        const newModule = {
            number: 3,
            name: "Modulo 3"
        };
        const response = await api
            .post('/api/module/')
            .send(newModule)
            .set('authorization', `Bearer ${adminLogin.body.token}`)
            .expect('Content-Type', /application\/json/)
            .expect(403)
        expect(response.body.error).toBe('Requiere rol de administrador');
        const allModules = await api.get('/api/module');
        expect(allModules.body).toHaveLength(initialModules.length);
    });

    test('a module cannot be created if the token is not sent', async () => {
        const adminLogin = await api
            .post('/api/auth/signin')
            .send(singnInAdminUser)
            .expect(200)
            .expect('Content-Type', /application\/json/)
        const newModule = {
            number: 3,
            name: "Modulo 3"
        };
        const response = await api
            .post('/api/module/')
            .send(newModule)
            .expect('Content-Type', /application\/json/)
            .expect(403)
        expect(response.body.error).toBe('No se proporcionó token');
        const allModules = await api.get('/api/module');
        expect(allModules.body).toHaveLength(initialModules.length);
    });

    test('a module cannot be created if the token has been modified', async () => {
        const adminLogin = await api
            .post('/api/auth/signin')
            .send(singnInAdminUser)
            .expect(200)
            .expect('Content-Type', /application\/json/)
        const newModule = {
            number: 3,
            name: "Modulo 3"
        };
        const response = await api
            .post('/api/module/')
            .send(newModule)
            .set('authorization', `Bearer ${adminLogin.body.token}modificado`)
            .expect('Content-Type', /application\/json/)
            .expect(401)
        expect(response.body.error).toBe('No autorizado');
        const allModules = await api.get('/api/module');
        expect(allModules.body).toHaveLength(initialModules.length);
    });

});

describe('GET /api/module/', () => {

    test('modules are returned as array', async () => {
        await api
            .get('/api/module/')
            .expect(200)
            .expect('Content-Type', /application\/json/)
    });

    test('there are two modules', async () => {
        const response = await api.get('/api/module');
        expect(response.body).toHaveLength(initialModules.length);
    });

    test('the first module is about number 1', async () => {
        const response = await api.get('/api/module');
        const contents = response.body.map(module => module.number);
        expect(contents).toContain(1);
    });
});






afterAll(async () => {
    await User.deleteMany({});
    mongoose.connection.close();
    server.close();
});
