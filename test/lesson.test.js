const mongoose = require('mongoose');
const supertest = require('supertest');
const { app, server } = require('../src/index');

const Module = require('../src/models/Module');
const User = require('../src/models/User');
// const Lesson = require('../src/models/Lesson');

const { initialModules, singleModule, student, signInStudent, adminUser, singnInAdminUser } = require('./helpers');

const api = supertest(app);
let tokenAdmin = "dsfsd";
let tokenUser = "sfdsfsdf";

beforeEach(async () => {
    //jest.setTimeout(60000);
    await Module.deleteMany({});
    await User.deleteMany({});
    for (const module of initialModules) {
        const moduleObject = new Module(module);
        await moduleObject.save();
    }
});


describe('DELETE /api/module/', () => {

    test('the module cannot be removed if the id does not match', async () => {
        const deleteModule = await Module.findOne({ name: initialModules[0].name });
        const response = await api
            .delete(`/api/module/${deleteModule._id}f`)
            .set('authorization', `Bearer ${tokenAdmin}`)
            .expect('Content-Type', /application\/json/)
            .expect(400)
        expect(response.body.error).toBe('El modulo no se encontró o no existe');
    });

    // test('the module cannot be deleted if the user is not admin', async () => {
    //     const deleteModule = await Module.findOne({ name: initialModules[0].name });
    //     const response = await api
    //         .put(`/api/module/${deleteModule._id}`)
    //         .set('authorization', `Bearer ${tokenUser}`)
    //         .expect('Content-Type', /application\/json/)
    //         .expect(403)
    //     expect(response.body.error).toBe('Requiere rol de administrador');
    // });

    // test('the module cannot be deleted if the token has been modified', async () => {
    //     const adminLogin = await api
    //         .post('/api/auth/signin')
    //         .send(singnInAdminUser)
    //         .expect(200)
    //         .expect('Content-Type', /application\/json/)
    //     const deleteModule = await Module.findOne({name: initialModules[0].name});
    //     const response = await api
    //         .put(`/api/module/${deleteModule._id}`)
    //         .set('authorization', `Bearer ${adminLogin.body.token}modi`)
    //         .expect('Content-Type', /application\/json/)
    //         .expect(401)
    //     expect(response.body.error).toBe('No autorizado');
    // });

    // test('delete a module with authenticated admin', async () => {
    //     const adminLogin = await api
    //         .post('/api/auth/signin')
    //         .send(singnInAdminUser)
    //         .expect(200)
    //         .expect('Content-Type', /application\/json/)
    //     const deleteModule = await Module.findOne({name: initialModules[0].name});
    //     const response = await api
    //         .delete(`/api/module/${deleteModule._id}`)
    //         .set('authorization', `Bearer ${adminLogin.body.token}`)
    //         .expect('Content-Type', /application\/json/)
    //         .expect(200)
    //     expect(response.body.message).toBe('Modulo eliminado correctamente');
    // });
});




afterAll(async () => {
    await User.deleteMany({});
    //await Lesson.deleteMany({});
    await Module.deleteMany({});
    mongoose.connection.close();
    server.close();
});