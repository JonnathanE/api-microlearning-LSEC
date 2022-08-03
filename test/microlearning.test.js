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

describe('POST /api/micro/', () => {
    test('CP40 create a new microcontent with an authenticated admin', async () => {
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
        // get models
        const modules = await api.get('/api/module');
        // creata a lesson
        await api
            .post('/api/lesson/')
            .set('authorization', `Bearer ${tokenAdmin}`)
            .set({ connection: 'keep-alive' })
            .field('name', 'lesson 1')
            .field('module', modules.body[0]._id)
            .attach('icon', 'test/fixtures/lsec.png')
            .expect(200)
        // get lessons
        const lessons = await api.get('/api/lesson');
        // create a microlearning
        const response = await api
            .post('/api/micro/')
            .set('authorization', `Bearer ${tokenAdmin}`)
            .set({ connection: 'keep-alive' })
            .field('title', 'microcontent 1')
            .field('lesson', lessons.body[0]._id)
            .attach('image', 'test/fixtures/lsec.png')
            .attach('gif', 'test/fixtures/lsec.png')
            .expect(200)
        expect(response.body.title).toBe('microcontent 1');
    });

    test('CP41 the microcontent is not created if it does not send all the parameters', async () => {
        const response = await api
            .post('/api/micro/')
            .set('authorization', `Bearer ${tokenAdmin}`)
            .set({ connection: 'keep-alive' })
            .field('title', 'microcontent 1')
            .attach('image', 'test/fixtures/lsec.png')
            .attach('gif', 'test/fixtures/lsec.png')
            .expect(400)
        expect(response.body.error).toBe('No se pudo crear el microcontenido');
    });

    test('CP42 microcontent is not created if user is not admin', async () => {
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
        // get lessons
        const lessons = await api.get('/api/lesson');
        // create microlearning
        const response = await api
            .post('/api/micro/')
            .set('authorization', `Bearer ${tokenUser}`)
            .set({ connection: 'keep-alive' })
            .field('title', 'microcontent 1')
            .field('lesson', lessons.body[0]._id)
            .attach('image', 'test/fixtures/lsec.png')
            .attach('gif', 'test/fixtures/lsec.png')
            .expect(403)
        expect(response.body.error).toBe('Requiere rol de administrador');
    });
});

describe('GET /api/micro/', () => {
    test('CP43 get all microcontent', async () => {
        await api
            .get('/api/micro/')
            .expect(200)
            .expect('Content-Type', /application\/json/)
    });

    test('CP44 get microcontent by id', async () => {
        const micro = await api
            .get('/api/micro/')
            .expect(200)
            .expect('Content-Type', /application\/json/)
        const response = await api
            .get(`/api/micro/${micro.body[0]._id}`)
            .expect(200)
            .expect('Content-Type', /application\/json/)
        expect(micro.body[0].title).toBe(response.body.title);
    });

    test('CP45 if an invalid id is provided it presents an error', async () => {
        const micro = await api
            .get('/api/micro/')
            .expect(200)
            .expect('Content-Type', /application\/json/)
        const response = await api
            .get(`/api/micro/${micro.body[0]._id}f`)
            .expect(400)
            .expect('Content-Type', /application\/json/)
        expect(response.body.error).toBe('El microcontenido no se encontró o no existe');
    });
});

describe('PUT /api/micro/', () => {

    test('CP46 update the parameter of the microcontent title', async () => {
        const micros = await api
            .get('/api/micro/')
            .expect(200)
            .expect('Content-Type', /application\/json/)
        const updateMicro = {
            title: 'Micro 137',
        }
        const response = await api
            .put(`/api/micro/${micros.body[0]._id}`)
            .send(updateMicro)
            .set('authorization', `Bearer ${tokenAdmin}`)
            .expect('Content-Type', /application\/json/)
            .expect(200)
        expect(response.body.message).toBe('El microcontenido se actualizado correctamente');
    });

    test('CP47 update the parameter of the microcontent lesson', async () => {
        const lessons = await api
            .get('/api/lesson/')
            .expect(200)
            .expect('Content-Type', /application\/json/)
        const micros = await api
            .get('/api/micro/')
            .expect(200)
            .expect('Content-Type', /application\/json/)
        const updateMicro = {
            lesson: lessons.body[0]._id
        }
        const response = await api
            .put(`/api/micro/${micros.body[0]._id}`)
            .send(updateMicro)
            .set('authorization', `Bearer ${tokenAdmin}`)
            .expect('Content-Type', /application\/json/)
            .expect(200)
        expect(response.body.message).toBe('El microcontenido se actualizado correctamente');
    });

    test('CP48 update title and lesson of the microcontnent', async () => {
        const lessons = await api
            .get('/api/lesson/')
            .expect(200)
            .expect('Content-Type', /application\/json/)
        const micros = await api
            .get('/api/micro/')
            .expect(200)
            .expect('Content-Type', /application\/json/)
        const updateMicro = {
            lesson: lessons.body[0]._id,
            title: 'Micro 137'
        }
        const response = await api
            .put(`/api/micro/${micros.body[0]._id}`)
            .send(updateMicro)
            .set('authorization', `Bearer ${tokenAdmin}`)
            .expect('Content-Type', /application\/json/)
            .expect(200)
        expect(response.body.message).toBe('El microcontenido se actualizado correctamente');
    });

    test('CP49 update microcontent image', async () => {
        const micros = await api
            .get('/api/micro/')
            .expect(200)
            .expect('Content-Type', /application\/json/)
        await api
            .put(`/api/micro/image/${micros.body[0]._id}`)
            .set('authorization', `Bearer ${tokenAdmin}`)
            .set({ connection: 'keep-alive' })
            .attach('image', 'test/fixtures/lsec.png')
            .expect(200)
    });

    test('CP50 the image does not update if an image is not submitted', async () => {
        const micros = await api
            .get('/api/micro/')
            .expect(200)
            .expect('Content-Type', /application\/json/)
        const response = await api
            .put(`/api/micro/image/${micros.body[0]._id}`)
            .set('authorization', `Bearer ${tokenAdmin}`)
            .expect(400)
        expect(response.body.error).toBe('No se pudo actualizar la imagen')
    });

    test('CP51 update microcontent gif', async () => {
        const micros = await api
            .get('/api/micro/')
            .expect(200)
            .expect('Content-Type', /application\/json/)
        await api
            .put(`/api/micro/gif/${micros.body[0]._id}`)
            .set('authorization', `Bearer ${tokenAdmin}`)
            .set({ connection: 'keep-alive' })
            .attach('gif', 'test/fixtures/lsec.png')
            .expect(200)
    });

    test('CP52 the gif does not update if an gif is not submitted', async () => {
        const micros = await api
            .get('/api/micro/')
            .expect(200)
            .expect('Content-Type', /application\/json/)
        const response = await api
            .put(`/api/micro/gif/${micros.body[0]._id}`)
            .set('authorization', `Bearer ${tokenAdmin}`)
            .expect(400)
        expect(response.body.error).toBe('No se pudo actualizar el GIF')
    });
});

describe('DELETE /api/micro/', () => {

    test('CP53 the microcontnet cannot be deleted if the id does not match', async () => {
        const micros = await api
            .get('/api/micro/')
            .expect(200)
            .expect('Content-Type', /application\/json/)
        const response = await api
            .delete(`/api/micro/${micros.body[0]._id}ff`)
            .set('authorization', `Bearer ${tokenAdmin}`)
            .expect('Content-Type', /application\/json/)
            .expect(400)
        expect(response.body.error).toBe('El microcontenido no se encontró o no existe');
    });

    test('CP54 the microcontent cannot be deleted if the token is not sent', async () => {
        const micros = await api
            .get('/api/micro/')
            .expect(200)
            .expect('Content-Type', /application\/json/)
        const response = await api
            .delete(`/api/micro/${micros.body[0]._id}`)
            .expect('Content-Type', /application\/json/)
            .expect(403)
        expect(response.body.error).toBe('No se proporcionó token');
    });

    test('CP55 the microcontent cannot be eliminated if the token is not valid', async () => {
        const micros = await api
            .get('/api/micro/')
            .expect(200)
            .expect('Content-Type', /application\/json/)
        const response = await api
            .delete(`/api/micro/${micros.body[0]._id}`)
            .set('authorization', `Bearer ${tokenAdmin}f`)
            .expect('Content-Type', /application\/json/)
            .expect(401)
        expect(response.body.error).toBe('No autorizado');
    });

    test('CP56 the microcontent cannot be deleted if the user is not admin', async () => {
        const micros = await api
            .get('/api/micro/')
            .expect(200)
            .expect('Content-Type', /application\/json/)
        const response = await api
            .delete(`/api/micro/${micros.body[0]._id}`)
            .set('authorization', `Bearer ${tokenUser}`)
            .expect('Content-Type', /application\/json/)
            .expect(403)
        expect(response.body.error).toBe('Requiere rol de administrador');
    });

    test('CP57 delete a microcontent with authenticated admin', async () => {
        const micros = await api
            .get('/api/micro/')
            .expect(200)
            .expect('Content-Type', /application\/json/)
        const response = await api
            .delete(`/api/micro/${micros.body[0]._id}`)
            .set('authorization', `Bearer ${tokenAdmin}`)
            .expect('Content-Type', /application\/json/)
            .expect(200)
        expect(response.body.message).toBe('El microcontenido se eliminó con éxito');
    });
});

afterAll(async () => {
    await Lesson.deleteMany({});
    await User.deleteMany({});
    await Module.deleteMany({});
    mongoose.connection.close();
    server.close();
});