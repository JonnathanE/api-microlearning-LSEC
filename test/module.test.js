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
        const deleteModule = await Module.findOne({name: initialModules[0].name});
        const response = await api
            .delete(`/api/module/${deleteModule._id}f`)
            .set('authorization', `Bearer ${tokenAdmin}`)
            .expect('Content-Type', /application\/json/)
            .expect(400)
        expect(response.body.error).toBe('El modulo no se encontró o no existe');
    });

    test('CP24 the module cannot be deleted if the user is not admin', async () => {
        const deleteModule = await Module.findOne({name: initialModules[0].name});
        const response = await api
            .put(`/api/module/${deleteModule._id}`)
            .set('authorization', `Bearer ${tokenUser}`)
            .expect('Content-Type', /application\/json/)
            .expect(403)
        expect(response.body.error).toBe('Requiere rol de administrador');
    });

    test('CP25 the module cannot be deleted if the token has been modified', async () => {
        const deleteModule = await Module.findOne({name: initialModules[0].name});
        const response = await api
            .put(`/api/module/${deleteModule._id}`)
            .set('authorization', `Bearer ${tokenAdmin}modi`)
            .expect('Content-Type', /application\/json/)
            .expect(401)
        expect(response.body.error).toBe('No autorizado');
    });

    test('CP26 delete a module with authenticated admin', async () => {
        const deleteModule = await Module.findOne({name: initialModules[0].name});
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


// describe('POST /api/micro/', () => {
//     test('create a new microcontent with an authenticated admin', async () => {
//         const adminLogin = await api
//             .post('/api/auth/signin')
//             .send(singnInAdminUser)
//             .expect(200)
//             .expect('Content-Type', /application\/json/)
//         const models = await api.get('/api/module');
//         await api
//                 .post('/api/lesson/')
//                 .set('authorization', `Bearer ${adminLogin.body.token}`)
//                 .set({connection: 'keep-alive'})
//                 .field('name', 'lesson 1')
//                 .field('module', models.body[0]._id)
//                 .attach('icon', 'test/fixtures/lsec.png')
//                 .expect(200)
//         const lessons = await api.get('/api/lesson');
//         const response = await api
//             .post('/api/micro/')
//             .set('authorization', `Bearer ${adminLogin.body.token}`)
//             .set({connection: 'keep-alive'})
//             .field('title', 'microcontent 1')
//             .field('lesson', lessons.body[0]._id)
//             .attach('image', 'test/fixtures/lsec.png')
//             .attach('gif', 'test/fixtures/lsec.png')
//             .expect(200)
//         expect(response.body.title).toBe('microcontent 1');
//     });

//     test('the microcontent is not created if it does not send all the parameters', async () => {
//         const adminLogin = await api
//             .post('/api/auth/signin')
//             .send(singnInAdminUser)
//             .expect(200)
//             .expect('Content-Type', /application\/json/)
//         const response = await api
//             .post('/api/micro/')
//             .set('authorization', `Bearer ${adminLogin.body.token}`)
//             .set({connection: 'keep-alive'})
//             .field('title', 'microcontent 1')
//             .attach('image', 'test/fixtures/lsec.png')
//             .attach('gif', 'test/fixtures/lsec.png')
//             .expect(400)
//         expect(response.body.error).toBe('No se pudo crear el microcontenido');
//     });
    
//     test('microcontent is not created if user is not admin', async () => {
//         const adminLogin = await api
//             .post('/api/auth/signin')
//             .send(signInStudent)
//             .expect(200)
//             .expect('Content-Type', /application\/json/)        
//         const lessons = await api.get('/api/lesson');
//         const response = await api
//             .post('/api/micro/')
//             .set('authorization', `Bearer ${adminLogin.body.token}`)
//             .set({connection: 'keep-alive'})
//             .field('title', 'microcontent 1')
//             .field('lesson', lessons.body[0]._id)
//             .attach('image', 'test/fixtures/lsec.png')
//             .attach('gif', 'test/fixtures/lsec.png')
//             .expect(403)
//         expect(response.body.error).toBe('Requiere rol de administrador');
//     });
// });

// describe('GET /api/micro/', () => {
//     test('get all microcontent', async () => {
//         await api
//             .get('/api/micro/')
//             .expect(200)
//             .expect('Content-Type', /application\/json/)
//     });

//     test('get microcontent by id', async () => {
//         const micro = await api
//             .get('/api/micro/')
//             .expect(200)
//             .expect('Content-Type', /application\/json/)
//         const response = await api
//             .get(`/api/micro/${micro.body[0]._id}`)
//             .expect(200)
//             .expect('Content-Type', /application\/json/)
//         expect(micro.body[0].title).toBe(response.body.title);
//     });

//     test('if an invalid id is provided it presents an error', async () => {
//         const micro = await api
//             .get('/api/micro/')
//             .expect(200)
//             .expect('Content-Type', /application\/json/)
//         const response = await api
//             .get(`/api/micro/${micro.body[0]._id}f`)
//             .expect(400)
//             .expect('Content-Type', /application\/json/)
//         expect(response.body.error).toBe('El microcontenido no se encontró o no existe');
//     });
// });

// describe('PUT /api/micro/', () => {
//     test('update the parameter of the microcontent title', async () => {
//         const adminLogin = await api
//             .post('/api/auth/signin')
//             .send(singnInAdminUser)
//             .expect(200)
//             .expect('Content-Type', /application\/json/)
//         const micros = await api
//             .get('/api/micro/')
//             .expect(200)
//             .expect('Content-Type', /application\/json/)
//         const updateMicro = {
//             title: 'Micro 137',
//         }
//         const response = await api
//             .put(`/api/micro/${micros.body[0]._id}`)
//             .send(updateMicro)
//             .set('authorization', `Bearer ${adminLogin.body.token}`)
//             .expect('Content-Type', /application\/json/)
//             .expect(200)
//         expect(response.body.message).toBe('El microcontenido se actualizado correctamente');
//     });

//     test('update the parameter of the microcontent lesson', async () => {
//         const adminLogin = await api
//             .post('/api/auth/signin')
//             .send(singnInAdminUser)
//             .expect(200)
//             .expect('Content-Type', /application\/json/)
//         const lessons = await api
//             .get('/api/lesson/')
//             .expect(200)
//             .expect('Content-Type', /application\/json/)
//         const micros = await api
//             .get('/api/micro/')
//             .expect(200)
//             .expect('Content-Type', /application\/json/)
//         const updateMicro = {
//             lesson: lessons.body[0]._id
//         }
//         const response = await api
//             .put(`/api/micro/${micros.body[0]._id}`)
//             .send(updateMicro)
//             .set('authorization', `Bearer ${adminLogin.body.token}`)
//             .expect('Content-Type', /application\/json/)
//             .expect(200)
//         expect(response.body.message).toBe('El microcontenido se actualizado correctamente');
//     });

//     test('update title and lesson of the microcontnent', async () => {
//         const adminLogin = await api
//             .post('/api/auth/signin')
//             .send(singnInAdminUser)
//             .expect(200)
//             .expect('Content-Type', /application\/json/)
//         const lessons = await api
//             .get('/api/lesson/')
//             .expect(200)
//             .expect('Content-Type', /application\/json/)
//         const micros = await api
//             .get('/api/micro/')
//             .expect(200)
//             .expect('Content-Type', /application\/json/)
//         const updateMicro = {
//             lesson: lessons.body[0]._id,
//             title: 'Micro 137'
//         }
//         const response = await api
//             .put(`/api/micro/${micros.body[0]._id}`)
//             .send(updateMicro)
//             .set('authorization', `Bearer ${adminLogin.body.token}`)
//             .expect('Content-Type', /application\/json/)
//             .expect(200)
//         expect(response.body.message).toBe('El microcontenido se actualizado correctamente');
//     });

//     test('update microcontent image', async () => {
//         const adminLogin = await api
//             .post('/api/auth/signin')
//             .send(singnInAdminUser)
//             .expect(200)
//             .expect('Content-Type', /application\/json/)
//         const micros = await api
//             .get('/api/micro/')
//             .expect(200)
//             .expect('Content-Type', /application\/json/)
//         await api
//             .put(`/api/micro/image/${micros.body[0]._id}`)
//             .set('authorization', `Bearer ${adminLogin.body.token}`)
//             .set({connection: 'keep-alive'})
//             .attach('image', 'test/fixtures/lsec.png')
//             .expect(200)
//     });

//     test('the image does not update if an image is not submitted', async () => {
//         const adminLogin = await api
//             .post('/api/auth/signin')
//             .send(singnInAdminUser)
//             .expect(200)
//             .expect('Content-Type', /application\/json/)
//         const micros = await api
//             .get('/api/micro/')
//             .expect(200)
//             .expect('Content-Type', /application\/json/)
//         const response = await api
//             .put(`/api/micro/image/${micros.body[0]._id}`)
//             .set('authorization', `Bearer ${adminLogin.body.token}`)
//             .expect(400)
//         expect(response.body.error).toBe('Debe de enviar una imagen')
//     });

//     test('update microcontent gif', async () => {
//         const adminLogin = await api
//             .post('/api/auth/signin')
//             .send(singnInAdminUser)
//             .expect(200)
//             .expect('Content-Type', /application\/json/)
//         const micros = await api
//             .get('/api/micro/')
//             .expect(200)
//             .expect('Content-Type', /application\/json/)
//         await api
//             .put(`/api/micro/gif/${micros.body[0]._id}`)
//             .set('authorization', `Bearer ${adminLogin.body.token}`)
//             .set({connection: 'keep-alive'})
//             .attach('gif', 'test/fixtures/lsec.png')
//             .expect(200)
//     });

//     test('the gif does not update if an gif is not submitted', async () => {
//         const adminLogin = await api
//             .post('/api/auth/signin')
//             .send(singnInAdminUser)
//             .expect(200)
//             .expect('Content-Type', /application\/json/)
//         const micros = await api
//             .get('/api/micro/')
//             .expect(200)
//             .expect('Content-Type', /application\/json/)
//         const response = await api
//             .put(`/api/micro/gif/${micros.body[0]._id}`)
//             .set('authorization', `Bearer ${adminLogin.body.token}`)
//             .expect(400)
//         expect(response.body.error).toBe('Debe de enviar un gif')
//     });
// });

// describe('DELETE /api/micro/', () => {

//     test('the microcontnet cannot be deleted if the id does not match', async () => {
//         const micros = await api
//             .get('/api/micro/')
//             .expect(200)
//             .expect('Content-Type', /application\/json/)
//         const adminLogin = await api
//             .post('/api/auth/signin')
//             .send(singnInAdminUser)
//             .expect(200)
//             .expect('Content-Type', /application\/json/)
//         const response = await api
//             .delete(`/api/micro/${micros.body[0]._id}ff`)
//             .set('authorization', `Bearer ${adminLogin.body.token}`)
//             .expect('Content-Type', /application\/json/)
//             .expect(400)
//         expect(response.body.error).toBe('El microcontenido no se encontró o no existe');
//     });

//     test('the microcontent cannot be deleted if the token is not sent', async () => {
//         const micros = await api
//             .get('/api/micro/')
//             .expect(200)
//             .expect('Content-Type', /application\/json/)
//         const response = await api
//             .delete(`/api/micro/${micros.body[0]._id}`)
//             .expect('Content-Type', /application\/json/)
//             .expect(403)
//         expect(response.body.error).toBe('No se proporcionó token');
//     });

//     test('the microcontent cannot be eliminated if the token is not valid', async () => {
//         const micros = await api
//             .get('/api/micro/')
//             .expect(200)
//             .expect('Content-Type', /application\/json/)
//         const adminLogin = await api
//             .post('/api/auth/signin')
//             .send(singnInAdminUser)
//             .expect(200)
//             .expect('Content-Type', /application\/json/)
//         const response = await api
//             .delete(`/api/micro/${micros.body[0]._id}`)
//             .set('authorization', `Bearer ${adminLogin.body.token}f`)
//             .expect('Content-Type', /application\/json/)
//             .expect(401)
//         expect(response.body.error).toBe('No autorizado');
//     });

//     test('the microcontent cannot be deleted if the user is not admin', async () => {
//         const micros = await api
//             .get('/api/micro/')
//             .expect(200)
//             .expect('Content-Type', /application\/json/)
//         const adminLogin = await api
//             .post('/api/auth/signin')
//             .send(signInStudent)
//             .expect(200)
//             .expect('Content-Type', /application\/json/)
//         const response = await api
//             .delete(`/api/micro/${micros.body[0]._id}`)
//             .set('authorization', `Bearer ${adminLogin.body.token}`)
//             .expect('Content-Type', /application\/json/)
//             .expect(403)
//         expect(response.body.error).toBe('Requiere rol de administrador');
//     });

//     test('delete a microcontent with authenticated admin', async () => {
//         const micros = await api
//             .get('/api/micro/')
//             .expect(200)
//             .expect('Content-Type', /application\/json/)
//         const adminLogin = await api
//             .post('/api/auth/signin')
//             .send(singnInAdminUser)
//             .expect(200)
//             .expect('Content-Type', /application\/json/)
//         const response = await api
//             .delete(`/api/micro/${micros.body[0]._id}`)
//             .set('authorization', `Bearer ${adminLogin.body.token}`)
//             .expect('Content-Type', /application\/json/)
//             .expect(200)
//         expect(response.body.message).toBe('El microcontenido se eliminó con éxito');
//     });
// });

// describe('POST /api/card', () => {
//     test('create a knowledge card', async () => {
//         const adminLogin = await api
//             .post('/api/auth/signin')
//             .send(singnInAdminUser)
//             .expect(200)
//             .expect('Content-Type', /application\/json/)
//         const models = await api.get('/api/module');
//         await api
//                 .post('/api/lesson/')
//                 .set('authorization', `Bearer ${adminLogin.body.token}`)
//                 .set({connection: 'keep-alive'})
//                 .field('name', 'lesson 1')
//                 .field('module', models.body[0]._id)
//                 .attach('icon', 'test/fixtures/lsec.png')
//                 .expect(200)
//         const lessons = await api.get('/api/lesson');
//         const response = await api
//             .post('/api/card')
//             .set('authorization', `Bearer ${adminLogin.body.token}`)
//             .set({connection: 'keep-alive'})
//             .field('question', 'pregunta')
//             .field('lesson', lessons.body[0]._id)
//             .field('correctAnswer', 'respuesta correcta')
//             .field('wrongAnswer', 'respuesta incorrecta')
//             .attach('gif', 'test/fixtures/lsec.png')
//             .expect(200)
//         expect(response.body.question).toBe('pregunta');
//     });

//     test('the knowledge card is not created if it does not send all the parameters', async () => {
//         const adminLogin = await api
//             .post('/api/auth/signin')
//             .send(singnInAdminUser)
//             .expect(200)
//             .expect('Content-Type', /application\/json/)
//         const response = await api
//             .post('/api/card')
//             .set('authorization', `Bearer ${adminLogin.body.token}`)
//             .set({connection: 'keep-alive'})
//             .field('question', 'question 1')
//             .attach('gif', 'test/fixtures/lsec.png')
//             .expect(400)
//         expect(response.body.error).toBe('No se ha creado');
//     });

//     test('knowledge card is not created if user is not admin', async () => {
//         const adminLogin = await api
//             .post('/api/auth/signin')
//             .send(signInStudent)
//             .expect(200)
//             .expect('Content-Type', /application\/json/)        
//         const lessons = await api.get('/api/lesson');
//         const response = await api
//             .post('/api/card')
//             .set('authorization', `Bearer ${adminLogin.body.token}`)
//             .set({connection: 'keep-alive'})
//             .field('question', 'pregunta')
//             .field('lesson', lessons.body[0]._id)
//             .field('correctAnswer', 'respuesta correcta')
//             .field('wrongAnswer', 'respuesta incorrecta')
//             .attach('gif', 'test/fixtures/lsec.png')
//             .expect(403)
//         expect(response.body.error).toBe('Requiere rol de administrador');
//     });
// });

// describe('GET /api/card', () => {
//     test('get all knowledge cards', async () => {
//         await api
//             .get('/api/card')
//             .expect(200)
//             .expect('Content-Type', /application\/json/)
//     });

//     test('get knowledge card by id', async () => {
//         const card = await api
//             .get('/api/card')
//             .expect(200)
//             .expect('Content-Type', /application\/json/)
//         const response = await api
//             .get(`/api/card/${card.body[0]._id}`)
//             .expect(200)
//             .expect('Content-Type', /application\/json/)
//         expect(card.body[0].title).toBe(response.body.title);
//     });

//     test('if an invalid id is provided it presents an error', async () => {
//         const card = await api
//             .get('/api/card')
//             .expect(200)
//             .expect('Content-Type', /application\/json/)
//         const response = await api
//             .get(`/api/card/${card.body[0]._id}f`)
//             .expect(400)
//             .expect('Content-Type', /application\/json/)
//         expect(response.body.error).toBe('La tarjeta de conocimiento no se encontró o no existe');
//     });
// });

// describe('PUT /api/card', () => {
//     test('update the parameter of the knowledge card question', async () => {
//         const adminLogin = await api
//             .post('/api/auth/signin')
//             .send(singnInAdminUser)
//             .expect(200)
//             .expect('Content-Type', /application\/json/)
//         const cards = await api
//             .get('/api/card')
//             .expect(200)
//             .expect('Content-Type', /application\/json/)
//         const updateCard = {
//             question: 'Card 137',
//         }
//         const response = await api
//             .put(`/api/card/${cards.body[0]._id}`)
//             .send(updateCard)
//             .set('authorization', `Bearer ${adminLogin.body.token}`)
//             .expect('Content-Type', /application\/json/)
//             .expect(200)
//         expect(response.body.message).toBe('La tarjeta de conocmiento se actualizado correctamente');
//     });

//     test('update the parameter of the knowledge card lesson', async () => {
//         const adminLogin = await api
//             .post('/api/auth/signin')
//             .send(singnInAdminUser)
//             .expect(200)
//             .expect('Content-Type', /application\/json/)
//         const lessons = await api
//             .get('/api/lesson/')
//             .expect(200)
//             .expect('Content-Type', /application\/json/)
//         const cards = await api
//             .get('/api/card')
//             .expect(200)
//             .expect('Content-Type', /application\/json/)
//         const updateCard = {
//             lesson: lessons.body[0]._id
//         }
//         const response = await api
//             .put(`/api/card/${cards.body[0]._id}`)
//             .send(updateCard)
//             .set('authorization', `Bearer ${adminLogin.body.token}`)
//             .expect('Content-Type', /application\/json/)
//             .expect(200)
//         expect(response.body.message).toBe('La tarjeta de conocmiento se actualizado correctamente');
//     });

//     test('update correctAnswer and wrongAnswer of the knowledge card', async () => {
//         const adminLogin = await api
//             .post('/api/auth/signin')
//             .send(singnInAdminUser)
//             .expect(200)
//             .expect('Content-Type', /application\/json/)
//         const cards = await api
//             .get('/api/card')
//             .expect(200)
//             .expect('Content-Type', /application\/json/)
//         const updateCard = {
//             correctAnswer: 'correct',
//             wrongAnswer: 'bad'
//         }
//         const response = await api
//             .put(`/api/card/${cards.body[0]._id}`)
//             .send(updateCard)
//             .set('authorization', `Bearer ${adminLogin.body.token}`)
//             .expect('Content-Type', /application\/json/)
//             .expect(200)
//         expect(response.body.message).toBe('La tarjeta de conocmiento se actualizado correctamente');
//     });

//     test('update knowledge card gif', async () => {
//         const adminLogin = await api
//             .post('/api/auth/signin')
//             .send(singnInAdminUser)
//             .expect(200)
//             .expect('Content-Type', /application\/json/)
//         const cards = await api
//             .get('/api/card')
//             .expect(200)
//             .expect('Content-Type', /application\/json/)
//         await api
//             .put(`/api/card/gif/${cards.body[0]._id}`)
//             .set('authorization', `Bearer ${adminLogin.body.token}`)
//             .set({connection: 'keep-alive'})
//             .attach('gif', 'test/fixtures/lsec.png')
//             .expect(200)
//     });

//     test('the gif does not update if an gif is not submitted', async () => {
//         const adminLogin = await api
//             .post('/api/auth/signin')
//             .send(singnInAdminUser)
//             .expect(200)
//             .expect('Content-Type', /application\/json/)
//         const cards = await api
//             .get('/api/card')
//             .expect(200)
//             .expect('Content-Type', /application\/json/)
//         const response = await api
//             .put(`/api/card/gif/${cards.body[0]._id}`)
//             .set('authorization', `Bearer ${adminLogin.body.token}`)
//             .expect(400)
//         expect(response.body.error).toBe('Debe de enviar un gif')
//     });
// });

// describe('DELETE /api/card', () => {

//     test('the knowledge cards cannot be deleted if the id does not match', async () => {
//         const cards = await api
//             .get('/api/card')
//             .expect(200)
//             .expect('Content-Type', /application\/json/)
//         const adminLogin = await api
//             .post('/api/auth/signin')
//             .send(singnInAdminUser)
//             .expect(200)
//             .expect('Content-Type', /application\/json/)
//         const response = await api
//             .delete(`/api/card/${cards.body[0]._id}ff`)
//             .set('authorization', `Bearer ${adminLogin.body.token}`)
//             .expect('Content-Type', /application\/json/)
//             .expect(400)
//         expect(response.body.error).toBe('La tarjeta de conocimiento no se encontró o no existe');
//     });

//     test('the knowledge cards cannot be deleted if the token is not sent', async () => {
//         const cards = await api
//             .get('/api/card')
//             .expect(200)
//             .expect('Content-Type', /application\/json/)
//         const response = await api
//             .delete(`/api/card/${cards.body[0]._id}`)
//             .expect('Content-Type', /application\/json/)
//             .expect(403)
//         expect(response.body.error).toBe('No se proporcionó token');
//     });

//     test('the knowledge cards cannot be eliminated if the token is not valid', async () => {
//         const cards = await api
//             .get('/api/card')
//             .expect(200)
//             .expect('Content-Type', /application\/json/)
//         const adminLogin = await api
//             .post('/api/auth/signin')
//             .send(singnInAdminUser)
//             .expect(200)
//             .expect('Content-Type', /application\/json/)
//         const response = await api
//             .delete(`/api/card/${cards.body[0]._id}`)
//             .set('authorization', `Bearer ${adminLogin.body.token}f`)
//             .expect('Content-Type', /application\/json/)
//             .expect(401)
//         expect(response.body.error).toBe('No autorizado');
//     });

//     test('the knowledge cards cannot be deleted if the user is not admin', async () => {
//         const cards = await api
//             .get('/api/card')
//             .expect(200)
//             .expect('Content-Type', /application\/json/)
//         const adminLogin = await api
//             .post('/api/auth/signin')
//             .send(signInStudent)
//             .expect(200)
//             .expect('Content-Type', /application\/json/)
//         const response = await api
//             .delete(`/api/card/${cards.body[0]._id}`)
//             .set('authorization', `Bearer ${adminLogin.body.token}`)
//             .expect('Content-Type', /application\/json/)
//             .expect(403)
//         expect(response.body.error).toBe('Requiere rol de administrador');
//     });

//     test('delete a knowledge cards with authenticated admin', async () => {
//         const cards = await api
//             .get('/api/card')
//             .expect(200)
//             .expect('Content-Type', /application\/json/)
//         const adminLogin = await api
//             .post('/api/auth/signin')
//             .send(singnInAdminUser)
//             .expect(200)
//             .expect('Content-Type', /application\/json/)
//         const response = await api
//             .delete(`/api/card/${cards.body[0]._id}`)
//             .set('authorization', `Bearer ${adminLogin.body.token}`)
//             .expect('Content-Type', /application\/json/)
//             .expect(200)
//         expect(response.body.message).toBe('La tarjeta de conocimiento se eliminó con éxito');
//     });
// });
