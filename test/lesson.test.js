const mongoose = require('mongoose');
const supertest = require('supertest');
const { app, server } = require('../src/index');

const Module = require('../src/models/Module');
const User = require('../src/models/User');
const Lesson = require('../src/models/Lesson');

const { initialModules, student, signInStudent, adminUser, singnInAdminUser } = require('./helpers');

const api = supertest(app);
let tokenAdmin = "dsfsd";
let tokenUser = "sfdsfsdf";

beforeEach(async () => {
    //jest.setTimeout(60000);
    await Module.deleteMany({});
    for (const module of initialModules) {
        const moduleObject = new Module(module);
        await moduleObject.save();
    }
});

describe('POST /api/lesson/', () => {

    test('CP27 create a new lesson with an authenticated admin', async () => {
        await User.deleteMany({});
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
        const models = await api.get('/api/module');
        const response = await api
            .post('/api/lesson/')
            .set('authorization', `Bearer ${tokenAdmin}`)
            .set({ connection: 'keep-alive' })
            .field('name', 'lesson 1')
            .field('module', models.body[0]._id)
            .attach('icon', 'test/fixtures/lsec.png')
            .expect(200)
        expect(response.body.name).toBe('lesson 1');
    });
});

describe('GET /api/lesson', () => {

    test('CP28 get all lesson', async () => {
        await api
            .get('/api/lesson/')
            .expect(200)
            .expect('Content-Type', /application\/json/)
    });

    test('CP29 get lesson by id', async () => {
        const lessons = await api
            .get('/api/lesson/')
            .expect(200)
            .expect('Content-Type', /application\/json/)
        const response = await api
            .get(`/api/lesson/${lessons.body[0]._id}`)
            .expect(200)
            .expect('Content-Type', /application\/json/)
        expect(lessons.body[0].name).toBe(response.body.name);
    });

    test('CP30 if an invalid id is provided it presents an error', async () => {
        const lessons = await api
            .get('/api/lesson/')
            .expect(200)
            .expect('Content-Type', /application\/json/)
        const response = await api
            .get(`/api/lesson/${lessons.body[0]._id}f`)
            .expect(400)
            .expect('Content-Type', /application\/json/)
        expect(response.body.error).toBe('La lección no se encontró o no existe');
    });
});

describe('PUT /api/lesson/', () => {

    test('CP31 update the parameter of the lesson name', async () => {
        const lessons = await api
            .get('/api/lesson/')
            .expect(200)
            .expect('Content-Type', /application\/json/)
        const updateLesson = {
            name: 'Lesson 137',
        }
        const response = await api
            .put(`/api/lesson/${lessons.body[0]._id}`)
            .send(updateLesson)
            .set('authorization', `Bearer ${tokenAdmin}`)
            .expect('Content-Type', /application\/json/)
            .expect(200)
        expect(response.body.message).toBe('Lección actualizado correctamente');
    });

    test('CP32 update the parameter of the lesson module', async () => {
        const lessons = await api
            .get('/api/lesson/')
            .expect(200)
            .expect('Content-Type', /application\/json/)
        const modules = await api
            .get('/api/module/')
            .expect(200)
            .expect('Content-Type', /application\/json/)
        const updateLesson = {
            module: modules.body[0]._id
        }
        const response = await api
            .put(`/api/lesson/${lessons.body[0]._id}`)
            .send(updateLesson)
            .set('authorization', `Bearer ${tokenAdmin}`)
            .expect('Content-Type', /application\/json/)
            .expect(200)
        expect(response.body.message).toBe('Lección actualizado correctamente');
    });

    test('CP33 update name and module of the lesson', async () => {
        const lessons = await api
            .get('/api/lesson/')
            .expect(200)
            .expect('Content-Type', /application\/json/)
        const modules = await api
            .get('/api/module/')
            .expect(200)
            .expect('Content-Type', /application\/json/)
        const updateLesson = {
            name: '137',
            module: modules.body[0]._id
        }
        const response = await api
            .put(`/api/lesson/${lessons.body[0]._id}`)
            .send(updateLesson)
            .set('authorization', `Bearer ${tokenAdmin}`)
            .expect('Content-Type', /application\/json/)
            .expect(200)
        expect(response.body.message).toBe('Lección actualizado correctamente');
    });

    test('CP34 update lesson icon', async () => {
        const lessons = await api
            .get('/api/lesson/')
            .expect(200)
            .expect('Content-Type', /application\/json/)
        const response = await api
            .put(`/api/lesson/icon/update/${lessons.body[0]._id}`)
            .set('authorization', `Bearer ${tokenAdmin}`)
            .set({ connection: 'keep-alive' })
            .attach('icon', 'test/fixtures/lsec.png')
            .expect(200)
    });
});

describe('DELETE /api/lesson/', () => {

    test('CP35 the lesson cannot be deleted if the id does not match', async () => {
        const lessons = await api
            .get('/api/lesson/')
            .expect(200)
            .expect('Content-Type', /application\/json/)
        const response = await api
            .delete(`/api/lesson/${lessons.body[0]._id}ff`)
            .set('authorization', `Bearer ${tokenAdmin}`)
            .expect('Content-Type', /application\/json/)
            .expect(400)
        expect(response.body.error).toBe('La lección no se encontró o no existe');
    });

    test('CP36 the lesson cannot be deleted if the token is not sent', async () => {
        const lessons = await api
            .get('/api/lesson/')
            .expect(200)
            .expect('Content-Type', /application\/json/)
        const response = await api
            .delete(`/api/lesson/${lessons.body[0]._id}`)
            .expect('Content-Type', /application\/json/)
            .expect(403)
        expect(response.body.error).toBe('No se proporcionó token');
    });

    test('CP37 the lesson cannot be eliminated if the token is not valid', async () => {
        const lessons = await api
            .get('/api/lesson/')
            .expect(200)
            .expect('Content-Type', /application\/json/)
        const response = await api
            .delete(`/api/lesson/${lessons.body[0]._id}`)
            .set('authorization', `Bearer ${tokenAdmin}f`)
            .expect('Content-Type', /application\/json/)
            .expect(401)
        expect(response.body.error).toBe('No autorizado');
    });

    test('CP38 the lesson cannot be deleted if the user is not admin', async () => {
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
        const lessons = await api
            .get('/api/lesson/')
            .expect(200)
            .expect('Content-Type', /application\/json/)
        const response = await api
            .delete(`/api/lesson/${lessons.body[0]._id}`)
            .set('authorization', `Bearer ${tokenUser}`)
            .expect('Content-Type', /application\/json/)
            .expect(403)
        expect(response.body.error).toBe('Requiere rol de administrador');
    });

    test('CP39 delete a lesson with authenticated admin', async () => {
        const lessons = await api
            .get('/api/lesson/')
            .expect(200)
            .expect('Content-Type', /application\/json/)
        const response = await api
            .delete(`/api/lesson/${lessons.body[0]._id}`)
            .set('authorization', `Bearer ${tokenAdmin}`)
            .expect('Content-Type', /application\/json/)
            .expect(200)
        expect(response.body.message).toBe('La lección se eliminó con éxito');
    });
});

afterAll(async () => {
    await Lesson.deleteMany({});
    await User.deleteMany({});
    await Module.deleteMany({});
    mongoose.connection.close();
    server.close();
});