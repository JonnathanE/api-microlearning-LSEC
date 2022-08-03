const mongoose = require('mongoose');
const supertest = require('supertest');
const { app, server } = require('../src/index');

const Module = require('../src/models/Module');
const User = require('../src/models/User');
// const Lesson = require('../src/models/Lesson');

const { initialModules, singleModule, student, signInStudent, adminUser, singnInAdminUser } = require('./helpers');

const api = supertest(app);
let tokenAdmin = "";
let tokenUser = "";

beforeEach(async () => {
    //jest.setTimeout(60000);
    await Module.deleteMany({});
    for (const module of initialModules) {
        const moduleObject = new Module(module);
        await moduleObject.save();
    }
});

describe('POST /api/module', () => {

    test('CP11 create a module with an authenticated admin', async () => {
        // create a new admin
        await api
            .post('/api/auth/signup')
            .send(adminUser)
            .expect(200)
            .expect('Content-Type', /application\/json/)
        // login admin
        const adminLogin = await api
            .post('/api/auth/signin')
            .send(singnInAdminUser)
            .expect(200)
            .expect('Content-Type', /application\/json/)
        // get token
        tokenAdmin = adminLogin.body.token
        // create module
        const response = await api
            .post('/api/module/')
            .send(singleModule)
            .set('authorization', `Bearer ${tokenAdmin}`)
            .expect('Content-Type', /application\/json/)
            .expect(200)
        expect(response.body.name).toBe(singleModule.name);
        const allModules = await api.get('/api/module');
        expect(allModules.body).toHaveLength(initialModules.length + 1);
    });

    test('CP12 a user without permission cannot create a module', async () => {
        // create a end user
        await api
            .post('/api/auth/signup')
            .send(student)
            .expect(200)
            .expect('Content-Type', /application\/json/)
        // login end user
        const userLogin = await api
            .post('/api/auth/signin')
            .send(signInStudent)
            .expect(200)
            .expect('Content-Type', /application\/json/)
        // get token
        tokenUser = userLogin.body.token
        // create a module
        const response = await api
            .post('/api/module/')
            .send(singleModule)
            .set('authorization', `Bearer ${tokenUser}`)
            .expect('Content-Type', /application\/json/)
            .expect(403)
        expect(response.body.error).toBe('Requiere rol de administrador');
        //const allModules = await api.get('/api/module');
        //expect(allModules.body).toHaveLength(initialModules.length);
    });

    test('CP13 a module cannot be created if the token is not sent', async () => {
        const response = await api
            .post('/api/module/')
            .send(singleModule)
            .expect('Content-Type', /application\/json/)
            .expect(403)
        expect(response.body.error).toBe('No se proporcionó token');
        //const allModules = await api.get('/api/module');
        //expect(allModules.body).toHaveLength(initialModules.length);
    });

    test('CP14 a module cannot be created if the token has been modified', async () => {
        const response = await api
            .post('/api/module/')
            .send(singleModule)
            .set('authorization', `Bearer ${tokenAdmin}modificado`)
            .expect('Content-Type', /application\/json/)
            .expect(401)
        expect(response.body.error).toBe('No autorizado');
        //const allModules = await api.get('/api/module');
        //expect(allModules.body).toHaveLength(initialModules.length);
    });

});

describe('GET /api/module/', () => {

    test('CP15 modules are returned as array', async () => {
        await api
            .get('/api/module/')
            .expect(200)
            .expect('Content-Type', /application\/json/)
    });

    test('CP16 there are two modules', async () => {
        const response = await api.get('/api/module');
        expect(response.body).toHaveLength(2);
    });

    test('CP17 the first module is about number 1', async () => {
        const response = await api.get('/api/module');
        const contents = response.body.map(module => module.number);
        expect(contents).toContain(1);
    });
});

describe('PUT /api/module/', () => {

    test('CP18 update a module with authenticated admin', async () => {
        const getModuleOne = await Module.findOne({ name: initialModules[0].name });
        const updateModule = {
            name: 'Modulo 1',
            number: 4
        }
        const response = await api
            .put(`/api/module/${getModuleOne._id}`)
            .send(updateModule)
            .set('authorization', `Bearer ${tokenAdmin}`)
            .expect('Content-Type', /application\/json/)
            .expect(200)
        expect(response.body.message).toBe('Modulo actualizado correctamente');
    });

    test('CP19 the module cannot be updated if the user is not admin', async () => {
        const getModuleOne = await Module.findOne({ name: initialModules[0].name });
        const updateModule = {
            name: 'Modulo 1',
            number: 1
        }
        const response = await api
            .put(`/api/module/${getModuleOne._id}`)
            .send(updateModule)
            .set('authorization', `Bearer ${tokenUser}`)
            .expect('Content-Type', /application\/json/)
            .expect(403)
        expect(response.body.error).toBe('Requiere rol de administrador');
    });

    test('CP20 the module cannot be updated if the token has been modified', async () => {
        const getModuleOne = await Module.findOne({ name: initialModules[0].name });
        const updateModule = {
            name: 'Modulo 1',
            number: 4
        }
        const response = await api
            .put(`/api/module/${getModuleOne._id}`)
            .send(updateModule)
            .set('authorization', `Bearer ${tokenAdmin}modi`)
            .expect('Content-Type', /application\/json/)
            .expect(401)
        expect(response.body.error).toBe('No autorizado');
    });

    test('CP21 update the module name', async () => {
        const getModuleOne = await Module.findOne({ name: initialModules[0].name });
        const updateModule = {
            name: 'Modulo 137',
        }
        const response = await api
            .put(`/api/module/${getModuleOne._id}`)
            .send(updateModule)
            .set('authorization', `Bearer ${tokenAdmin}`)
            .expect('Content-Type', /application\/json/)
            .expect(200)
        expect(response.body.message).toBe('Modulo actualizado correctamente');
    });

    test('CP22 update the module number', async () => {
        const getModuleOne = await Module.findOne({ name: initialModules[0].name });
        const updateModule = {
            number: 137,
        }
        const response = await api
            .put(`/api/module/${getModuleOne._id}`)
            .send(updateModule)
            .set('authorization', `Bearer ${tokenAdmin}`)
            .expect('Content-Type', /application\/json/)
            .expect(200)
        expect(response.body.message).toBe('Modulo actualizado correctamente');
    });
});


describe('DELETE /api/module/', () => {

    test('CP23 the module cannot be removed if the id does not match', async () => {
        const deleteModule = await Module.findOne({ name: initialModules[0].name });
        const response = await api
            .delete(`/api/module/${deleteModule._id}f`)
            .set('authorization', `Bearer ${tokenAdmin}`)
            .expect('Content-Type', /application\/json/)
            .expect(400)
        expect(response.body.error).toBe('El modulo no se encontró o no existe');
    });

    test('CP24 the module cannot be deleted if the user is not admin', async () => {
        const deleteModule = await Module.findOne({ name: initialModules[0].name });
        const response = await api
            .put(`/api/module/${deleteModule._id}`)
            .set('authorization', `Bearer ${tokenUser}`)
            .expect('Content-Type', /application\/json/)
            .expect(403)
        expect(response.body.error).toBe('Requiere rol de administrador');
    });

    test('CP25 the module cannot be deleted if the token has been modified', async () => {
        const deleteModule = await Module.findOne({ name: initialModules[0].name });
        const response = await api
            .put(`/api/module/${deleteModule._id}`)
            .set('authorization', `Bearer ${tokenAdmin}modi`)
            .expect('Content-Type', /application\/json/)
            .expect(401)
        expect(response.body.error).toBe('No autorizado');
    });

    test('CP26 delete a module with authenticated admin', async () => {
        const deleteModule = await Module.findOne({ name: initialModules[0].name });
        const response = await api
            .delete(`/api/module/${deleteModule._id}`)
            .set('authorization', `Bearer ${tokenAdmin}`)
            .expect('Content-Type', /application\/json/)
            .expect(200)
        expect(response.body.message).toBe('Modulo eliminado correctamente');
    });
});

afterAll(async () => {
    await User.deleteMany({});
    //await Lesson.deleteMany({});
    await Module.deleteMany({});
    mongoose.connection.close();
    server.close();
});
