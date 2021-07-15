const mongoose = require('mongoose');
const supertest = require('supertest');
const { app, server } = require('../src/index');
const Module = require('../src/models/Module');
const { initialModules } = require('./helpers');

const api = supertest(app);

beforeEach(async () => {
    await Module.deleteMany({});

    for (const module of initialModules) {
        const moduleObject = new Module(module);
        await moduleObject.save();
    }
});

test('modules are returned as array', async () => {
    await api
        .get('/api/module/')
        .expect(200)
        .expect('Content-Type', /application\/json/)

})

test('there are two modules', async () => {
    const response = await api.get('/api/module');
    expect(response.body).toHaveLength(initialModules.length);
})

test('the first module is about number 1', async () => {
    const response = await api.get('/api/module');

    const contents = response.body.map(module => module.number);

    expect(contents).toContain(1);
})



afterAll(() => {
    mongoose.connection.close();
    server.close();
});
