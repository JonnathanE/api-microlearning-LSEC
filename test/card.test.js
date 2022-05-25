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

describe('POST /api/card', () => {
    test('CP58 create a knowledge card', async () => {
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
        // get modules
        const modules = await api.get('/api/module');
        // create a lesson
        await api
            .post('/api/lesson/')
            .set('authorization', `Bearer ${adminLogin.body.token}`)
            .set({ connection: 'keep-alive' })
            .field('name', 'lesson 1')
            .field('module', modules.body[0]._id)
            .attach('icon', 'test/fixtures/lsec.png')
            .expect(200)
        // get lessons
        const lessons = await api.get('/api/lesson');
        // create a card
        const response = await api
            .post('/api/card')
            .set('authorization', `Bearer ${tokenAdmin}`)
            .set({ connection: 'keep-alive' })
            .field('question', 'pregunta')
            .field('lesson', lessons.body[0]._id)
            .field('correctAnswer', 'respuesta correcta')
            .field('wrongAnswer', 'respuesta incorrecta')
            .attach('gif', 'test/fixtures/lsec.png')
            .expect(200)
        expect(response.body.question).toBe('pregunta');
    });

    test('CP59 the knowledge card is not created if it does not send all the parameters', async () => {
        const response = await api
            .post('/api/card')
            .set('authorization', `Bearer ${tokenAdmin}`)
            .set({ connection: 'keep-alive' })
            .field('question', 'question 1')
            .attach('gif', 'test/fixtures/lsec.png')
            .expect(400)
        expect(response.body.error).toBe('No se ha creado');
    });

    test('CP60 knowledge card is not created if user is not admin', async () => {
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
        // create card
        const response = await api
            .post('/api/card')
            .set('authorization', `Bearer ${tokenUser}`)
            .set({ connection: 'keep-alive' })
            .field('question', 'pregunta')
            .field('lesson', lessons.body[0]._id)
            .field('correctAnswer', 'respuesta correcta')
            .field('wrongAnswer', 'respuesta incorrecta')
            .attach('gif', 'test/fixtures/lsec.png')
            .expect(403)
        expect(response.body.error).toBe('Requiere rol de administrador');
    });
});

describe('GET /api/card', () => {

    test('CP61 get all knowledge cards', async () => {
        await api
            .get('/api/card')
            .expect(200)
            .expect('Content-Type', /application\/json/)
    });

    test('CP62 get knowledge card by id', async () => {
        const card = await api
            .get('/api/card')
            .expect(200)
            .expect('Content-Type', /application\/json/)
        const response = await api
            .get(`/api/card/${card.body[0]._id}`)
            .expect(200)
            .expect('Content-Type', /application\/json/)
        expect(card.body[0].title).toBe(response.body.title);
    });

    test('CP63 if an invalid id is provided it presents an error', async () => {
        const card = await api
            .get('/api/card')
            .expect(200)
            .expect('Content-Type', /application\/json/)
        const response = await api
            .get(`/api/card/${card.body[0]._id}f`)
            .expect(400)
            .expect('Content-Type', /application\/json/)
        expect(response.body.error).toBe('La tarjeta de conocimiento no se encontró o no existe');
    });
});

describe('PUT /api/card', () => {

    test('CP64 update the parameter of the knowledge card question', async () => {
        const cards = await api
            .get('/api/card')
            .expect(200)
            .expect('Content-Type', /application\/json/)
        const updateCard = {
            question: 'Card 137',
        }
        const response = await api
            .put(`/api/card/${cards.body[0]._id}`)
            .send(updateCard)
            .set('authorization', `Bearer ${tokenAdmin}`)
            .expect('Content-Type', /application\/json/)
            .expect(200)
        expect(response.body.message).toBe('La tarjeta de conocmiento se actualizado correctamente');
    });

    test('CP65 update the parameter of the knowledge card lesson', async () => {
        const lessons = await api
            .get('/api/lesson/')
            .expect(200)
            .expect('Content-Type', /application\/json/)
        const cards = await api
            .get('/api/card')
            .expect(200)
            .expect('Content-Type', /application\/json/)
        const updateCard = {
            lesson: lessons.body[0]._id
        }
        const response = await api
            .put(`/api/card/${cards.body[0]._id}`)
            .send(updateCard)
            .set('authorization', `Bearer ${tokenAdmin}`)
            .expect('Content-Type', /application\/json/)
            .expect(200)
        expect(response.body.message).toBe('La tarjeta de conocmiento se actualizado correctamente');
    });

    test('CP66 update correctAnswer and wrongAnswer of the knowledge card', async () => {
        const cards = await api
            .get('/api/card')
            .expect(200)
            .expect('Content-Type', /application\/json/)
        const updateCard = {
            correctAnswer: 'correct',
            wrongAnswer: 'bad'
        }
        const response = await api
            .put(`/api/card/${cards.body[0]._id}`)
            .send(updateCard)
            .set('authorization', `Bearer ${tokenAdmin}`)
            .expect('Content-Type', /application\/json/)
            .expect(200)
        expect(response.body.message).toBe('La tarjeta de conocmiento se actualizado correctamente');
    });

    test('CP67 update knowledge card gif', async () => {
        const cards = await api
            .get('/api/card')
            .expect(200)
            .expect('Content-Type', /application\/json/)
        await api
            .put(`/api/card/gif/${cards.body[0]._id}`)
            .set('authorization', `Bearer ${tokenAdmin}`)
            .set({ connection: 'keep-alive' })
            .attach('gif', 'test/fixtures/lsec.png')
            .expect(200)
    });

    test('CP68 the gif does not update if an gif is not submitted', async () => {
        const cards = await api
            .get('/api/card')
            .expect(200)
            .expect('Content-Type', /application\/json/)
        const response = await api
            .put(`/api/card/gif/${cards.body[0]._id}`)
            .set('authorization', `Bearer ${tokenAdmin}`)
            .expect(400)
        expect(response.body.error).toBe('No se pudo actualizar el GIF')
    });
});

describe('DELETE /api/card', () => {

    test('CP69 the knowledge cards cannot be deleted if the id does not match', async () => {
        const cards = await api
            .get('/api/card')
            .expect(200)
            .expect('Content-Type', /application\/json/)
        const response = await api
            .delete(`/api/card/${cards.body[0]._id}ff`)
            .set('authorization', `Bearer ${tokenAdmin}`)
            .expect('Content-Type', /application\/json/)
            .expect(400)
        expect(response.body.error).toBe('La tarjeta de conocimiento no se encontró o no existe');
    });

    test('CP70 the knowledge cards cannot be deleted if the token is not sent', async () => {
        const cards = await api
            .get('/api/card')
            .expect(200)
            .expect('Content-Type', /application\/json/)
        const response = await api
            .delete(`/api/card/${cards.body[0]._id}`)
            .expect('Content-Type', /application\/json/)
            .expect(403)
        expect(response.body.error).toBe('No se proporcionó token');
    });

    test('CP71 the knowledge cards cannot be eliminated if the token is not valid', async () => {
        const cards = await api
            .get('/api/card')
            .expect(200)
            .expect('Content-Type', /application\/json/)
        const response = await api
            .delete(`/api/card/${cards.body[0]._id}`)
            .set('authorization', `Bearer ${tokenAdmin}f`)
            .expect('Content-Type', /application\/json/)
            .expect(401)
        expect(response.body.error).toBe('No autorizado');
    });

    test('CP72 the knowledge cards cannot be deleted if the user is not admin', async () => {
        const cards = await api
            .get('/api/card')
            .expect(200)
            .expect('Content-Type', /application\/json/)
        const response = await api
            .delete(`/api/card/${cards.body[0]._id}`)
            .set('authorization', `Bearer ${tokenUser}`)
            .expect('Content-Type', /application\/json/)
            .expect(403)
        expect(response.body.error).toBe('Requiere rol de administrador');
    });

    test('CP73 delete a knowledge cards with authenticated admin', async () => {
        const cards = await api
            .get('/api/card')
            .expect(200)
            .expect('Content-Type', /application\/json/)
        const response = await api
            .delete(`/api/card/${cards.body[0]._id}`)
            .set('authorization', `Bearer ${tokenAdmin}`)
            .expect('Content-Type', /application\/json/)
            .expect(200)
        expect(response.body.message).toBe('La tarjeta de conocimiento se eliminó con éxito');
    });
});

afterAll(async () => {
    await Lesson.deleteMany({});
    await User.deleteMany({});
    await Module.deleteMany({});
    mongoose.connection.close();
    server.close();
});