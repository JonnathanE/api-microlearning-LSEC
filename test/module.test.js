const mongoose = require('mongoose');
const supertest = require('supertest');
const { app, server } = require('../src/index');

const Module = require('../src/models/Module');
const User = require('../src/models/User');
const Lesson = require('../src/models/Lesson');

const { initialModules, student, signInStudent, adminUser, singnInAdminUser } = require('./helpers');

const api = supertest(app);

beforeEach(async () => {
    jest.setTimeout(60000);
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

describe('PUT /api/module/', () => {

    test('update a module with authenticated admin', async () => {
        const adminLogin = await api
            .post('/api/auth/signin')
            .send(singnInAdminUser)
            .expect(200)
            .expect('Content-Type', /application\/json/)
        const getModuleOne = await Module.findOne({name: initialModules[0].name});
        const updateModule = {
            name: 'Modulo 1',
            number: 4
        }
        const response = await api
            .put(`/api/module/${getModuleOne._id}`)
            .send(updateModule)
            .set('authorization', `Bearer ${adminLogin.body.token}`)
            .expect('Content-Type', /application\/json/)
            .expect(200)
        expect(response.body.message).toBe('Modulo actualizado correctamente');
    });

    test('the module cannot be updated if the user is not admin', async () => {
        const adminLogin = await api
            .post('/api/auth/signin')
            .send(signInStudent)
            .expect(200)
            .expect('Content-Type', /application\/json/)
        const getModuleOne = await Module.findOne({name: initialModules[0].name});
        const updateModule = {
            name: 'Modulo 1',
            number: 1
        }
        const response = await api
            .put(`/api/module/${getModuleOne._id}`)
            .send(updateModule)
            .set('authorization', `Bearer ${adminLogin.body.token}`)
            .expect('Content-Type', /application\/json/)
            .expect(403)
        expect(response.body.error).toBe('Requiere rol de administrador');
    });

    test('the module cannot be updated if the token has been modified', async () => {
        const adminLogin = await api
            .post('/api/auth/signin')
            .send(singnInAdminUser)
            .expect(200)
            .expect('Content-Type', /application\/json/)
        const getModuleOne = await Module.findOne({name: initialModules[0].name});
        const updateModule = {
            name: 'Modulo 1',
            number: 4
        }
        const response = await api
            .put(`/api/module/${getModuleOne._id}`)
            .send(updateModule)
            .set('authorization', `Bearer ${adminLogin.body.token}modi`)
            .expect('Content-Type', /application\/json/)
            .expect(401)
        expect(response.body.error).toBe('No autorizado');
    });

    test('update the module name', async () => {
        const adminLogin = await api
            .post('/api/auth/signin')
            .send(singnInAdminUser)
            .expect(200)
            .expect('Content-Type', /application\/json/)
        const getModuleOne = await Module.findOne({name: initialModules[0].name});
        const updateModule = {
            name: 'Modulo 137',
        }
        const response = await api
            .put(`/api/module/${getModuleOne._id}`)
            .send(updateModule)
            .set('authorization', `Bearer ${adminLogin.body.token}`)
            .expect('Content-Type', /application\/json/)
            .expect(200)
        expect(response.body.message).toBe('Modulo actualizado correctamente');
    });

    test('update the module number', async () => {
        const adminLogin = await api
            .post('/api/auth/signin')
            .send(singnInAdminUser)
            .expect(200)
            .expect('Content-Type', /application\/json/)
        const getModuleOne = await Module.findOne({name: initialModules[0].name});
        const updateModule = {
            number: 137,
        }
        const response = await api
            .put(`/api/module/${getModuleOne._id}`)
            .send(updateModule)
            .set('authorization', `Bearer ${adminLogin.body.token}`)
            .expect('Content-Type', /application\/json/)
            .expect(200)
        expect(response.body.message).toBe('Modulo actualizado correctamente');
    });
});

describe('DELETE /api/module/', () => {

    test('the module cannot be removed if the id does not match', async () => {
        const adminLogin = await api
            .post('/api/auth/signin')
            .send(singnInAdminUser)
            .expect(200)
            .expect('Content-Type', /application\/json/)
        const deleteModule = await Module.findOne({name: initialModules[0].name});
        const response = await api
            .delete(`/api/module/${deleteModule._id}f`)
            .set('authorization', `Bearer ${adminLogin.body.token}`)
            .expect('Content-Type', /application\/json/)
            .expect(400)
        expect(response.body.error).toBe('El modulo no se encontró o no existe');
    });

    test('the module cannot be deleted if the user is not admin', async () => {
        const adminLogin = await api
            .post('/api/auth/signin')
            .send(signInStudent)
            .expect(200)
            .expect('Content-Type', /application\/json/)
        const deleteModule = await Module.findOne({name: initialModules[0].name});
        const response = await api
            .put(`/api/module/${deleteModule._id}`)
            .set('authorization', `Bearer ${adminLogin.body.token}`)
            .expect('Content-Type', /application\/json/)
            .expect(403)
        expect(response.body.error).toBe('Requiere rol de administrador');
    });

    test('the module cannot be deleted if the token has been modified', async () => {
        const adminLogin = await api
            .post('/api/auth/signin')
            .send(singnInAdminUser)
            .expect(200)
            .expect('Content-Type', /application\/json/)
        const deleteModule = await Module.findOne({name: initialModules[0].name});
        const response = await api
            .put(`/api/module/${deleteModule._id}`)
            .set('authorization', `Bearer ${adminLogin.body.token}modi`)
            .expect('Content-Type', /application\/json/)
            .expect(401)
        expect(response.body.error).toBe('No autorizado');
    });

    test('delete a module with authenticated admin', async () => {
        const adminLogin = await api
            .post('/api/auth/signin')
            .send(singnInAdminUser)
            .expect(200)
            .expect('Content-Type', /application\/json/)
        const deleteModule = await Module.findOne({name: initialModules[0].name});
        const response = await api
            .delete(`/api/module/${deleteModule._id}`)
            .set('authorization', `Bearer ${adminLogin.body.token}`)
            .expect('Content-Type', /application\/json/)
            .expect(200)
        expect(response.body.message).toBe('Modulo eliminado correctamente');
    });
});

describe('POST /api/lesson/', () => {
    test('create a new lesson with an authenticated admin', async () => {
        const adminLogin = await api
            .post('/api/auth/signin')
            .send(singnInAdminUser)
            .expect(200)
            .expect('Content-Type', /application\/json/)
        const models = await api.get('/api/module');
        const response = await api
            .post('/api/lesson/')
            .set('authorization', `Bearer ${adminLogin.body.token}`)
            .set({connection: 'keep-alive'})
            .field('name', 'lesson 1')
            .field('module', models.body[0]._id)
            .attach('icon', 'test/fixtures/lsec.png')
            .expect(200)
        expect(response.body.name).toBe('lesson 1');
    });

    test.skip('you cannot create a new lesson if the token is not valid', async () => {
        const adminLogin = await api
            .post('/api/auth/signin')
            .send(singnInAdminUser)
            .expect(200)
            .expect('Content-Type', /application\/json/)
        const models = await api.get('/api/module');
        const response = await api
            .post('/api/lesson/')
            .set('authorization', `Bearer ${adminLogin.body.token}mo`)
            .set({connection: 'keep-alive'})
            .field('name', 'lesson 2')
            .field('module', models.body[0]._id)
            .attach('icon', 'test/fixtures/lsec.png')
            .expect(401)
        expect(response.body.error).toBe('No autorizado')
    });

    test.skip('the lesson is not created if the token is not sent', async () => {
        const models = await api.get('/api/module');
        const response = await api
            .post('/api/lesson/')
            .set({connection: 'keep-alive'})
            .field('name', 'lesson 3')
            .field('module', models.body[0]._id)
            .attach('icon', 'test/fixtures/lsec.png')
            .expect(403)
            expect(response.body.error).toBe('No se proporcionó token');
    });
});

describe('GET /api/lesson', () => {
    test('get all lesson', async () => {
        await api
            .get('/api/lesson/')
            .expect(200)
            .expect('Content-Type', /application\/json/)
    });

    test('get lesson by', async () => {
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

    test('if an invalid id is provided it presents an error', async () => {
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
    test('update the parameter of the lesson name', async () => {
        const adminLogin = await api
            .post('/api/auth/signin')
            .send(singnInAdminUser)
            .expect(200)
            .expect('Content-Type', /application\/json/)
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
            .set('authorization', `Bearer ${adminLogin.body.token}`)
            .expect('Content-Type', /application\/json/)
            .expect(200)
        expect(response.body.message).toBe('Lección actualizado correctamente');
        const lessonsw = await api
            .get('/api/lesson/')
            .expect(200)
            .expect('Content-Type', /application\/json/)
    });

    test('update the parameter of the lesson module', async () => {
        const adminLogin = await api
            .post('/api/auth/signin')
            .send(singnInAdminUser)
            .expect(200)
            .expect('Content-Type', /application\/json/)
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
            .set('authorization', `Bearer ${adminLogin.body.token}`)
            .expect('Content-Type', /application\/json/)
            .expect(200)
        expect(response.body.message).toBe('Lección actualizado correctamente');
    });

    test('update name and module of the lesson', async () => {
        const adminLogin = await api
            .post('/api/auth/signin')
            .send(singnInAdminUser)
            .expect(200)
            .expect('Content-Type', /application\/json/)
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
            .set('authorization', `Bearer ${adminLogin.body.token}`)
            .expect('Content-Type', /application\/json/)
            .expect(200)
        expect(response.body.message).toBe('Lección actualizado correctamente');
    });
    test('update lesson icon', async () => {
        const adminLogin = await api
            .post('/api/auth/signin')
            .send(singnInAdminUser)
            .expect(200)
            .expect('Content-Type', /application\/json/)
        const lessons = await api
            .get('/api/lesson/')
            .expect(200)
            .expect('Content-Type', /application\/json/)
        const response = await api
            .put(`/api/lesson/icon/update/${lessons.body[0]._id}`)
            .set('authorization', `Bearer ${adminLogin.body.token}`)
            .set({connection: 'keep-alive'})
            .attach('icon', 'test/fixtures/lsec.png')
            .expect(200)
    });
});

describe('DELETE /api/lesson/', () => {

    test('the lesson cannot be deleted if the id does not match', async () => {
        const lessons = await api
            .get('/api/lesson/')
            .expect(200)
            .expect('Content-Type', /application\/json/)
        const adminLogin = await api
            .post('/api/auth/signin')
            .send(singnInAdminUser)
            .expect(200)
            .expect('Content-Type', /application\/json/)
        const response = await api
            .delete(`/api/lesson/${lessons.body[0]._id}ff`)
            .set('authorization', `Bearer ${adminLogin.body.token}`)
            .expect('Content-Type', /application\/json/)
            .expect(400)
        expect(response.body.error).toBe('La lección no se encontró o no existe');
    });

    test('the lesson cannot be deleted if the token is not sent', async () => {
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

    test('the lesson cannot be eliminated if the token is not valid', async () => {
        const lessons = await api
            .get('/api/lesson/')
            .expect(200)
            .expect('Content-Type', /application\/json/)
        const adminLogin = await api
            .post('/api/auth/signin')
            .send(singnInAdminUser)
            .expect(200)
            .expect('Content-Type', /application\/json/)
        const response = await api
            .delete(`/api/lesson/${lessons.body[0]._id}`)
            .set('authorization', `Bearer ${adminLogin.body.token}f`)
            .expect('Content-Type', /application\/json/)
            .expect(401)
        expect(response.body.error).toBe('No autorizado');
    });

    test('the lesson cannot be deleted if the user is not admin', async () => {
        const lessons = await api
            .get('/api/lesson/')
            .expect(200)
            .expect('Content-Type', /application\/json/)
        const adminLogin = await api
            .post('/api/auth/signin')
            .send(signInStudent)
            .expect(200)
            .expect('Content-Type', /application\/json/)
        const response = await api
            .delete(`/api/lesson/${lessons.body[0]._id}`)
            .set('authorization', `Bearer ${adminLogin.body.token}`)
            .expect('Content-Type', /application\/json/)
            .expect(403)
        expect(response.body.error).toBe('Requiere rol de administrador');
    });

    test('delete a lesson with authenticated admin', async () => {
        const lessons = await api
            .get('/api/lesson/')
            .expect(200)
            .expect('Content-Type', /application\/json/)
        const adminLogin = await api
            .post('/api/auth/signin')
            .send(singnInAdminUser)
            .expect(200)
            .expect('Content-Type', /application\/json/)
        const response = await api
            .delete(`/api/lesson/${lessons.body[0]._id}`)
            .set('authorization', `Bearer ${adminLogin.body.token}`)
            .expect('Content-Type', /application\/json/)
            .expect(200)
        expect(response.body.message).toBe('La lección se eliminó con éxito');
    });
});

afterAll(async () => {
    await User.deleteMany({});
    await Lesson.deleteMany({});
    mongoose.connection.close();
    server.close();
});
