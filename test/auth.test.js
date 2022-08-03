const mongoose = require('mongoose');
const supertest = require('supertest');
const { app, server } = require('../src/index');

const User = require('../src/models/User');

const { student, signInStudent, adminUser, singnInAdminUser } = require('./helpers');

const api = supertest(app);

describe('POST /api/auth/signup', () => {

    test('CP01 create an end user', async () => {
        await api
            .post('/api/auth/signup')
            .send(student)
            .expect(200)
            .expect('Content-Type', /application\/json/)
        const response = await User.findOne({ email: student.email });
        expect(response.email).toBe(student.email);
    });

    test('CP02 end user with repeated email cannot create the account', async () => {
        await api
            .post('/api/auth/signup')
            .send(student)
            .expect(400)
            .expect('Content-Type', /application\/json/)
        const response = await User.find({ email: student.email });
        expect(response.length).toBe(1);
    })

    test('CP03 an end user cannot create the account if they do not fill in all the parameters', async () => {
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

    test('CP04 create a admin', async () => {
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

    test('CP05 log in end user', async () => {
        const response = await api
            .post('/api/auth/signin')
            .send(signInStudent)
            .expect(200)
            .expect('Content-Type', /application\/json/)
        expect(response.body.email).toBe(signInStudent.email);
    });

    test('CP06 the end user cannot enter with a different email address', async () => {
        const newSignInStudent = {
            email: 'diferent@unl.edu.ec',
            password: signInStudent.password
        }
        const response = await api
            .post('/api/auth/signin')
            .send(newSignInStudent)
            .expect(400)
            .expect('Content-Type', /application\/json/)
        expect(response.body.error).toBe('El usuario con ese correo electrónico no existe');
    });

    test('CP07 end user cannot login with wrong password', async () => {
        const newSignInStudent = {
            email: signInStudent.email,
            password: 'fdgs'
        }
        const response = await api
            .post('/api/auth/signin')
            .send(newSignInStudent)
            .expect(401)
            .expect('Content-Type', /application\/json/)
        expect(response.body.error).toBe('El correo electrónico o la contraseña no coinciden');
    });
});

describe('POST /api/auth/signinadmin', () => {

    test('CP08 login admin', async () => {
        const response = await api
            .post('/api/auth/signinadmin')
            .send(singnInAdminUser)
            .expect(200)
            .expect('Content-Type', /application\/json/)
        expect(response.body.email).toBe(singnInAdminUser.email);
    });

    test('CP09 the admin cannot enter with a different email address', async () => {
        const newSignInAdmin = {
            email: 'diferent@unl.edu.ec',
            password: singnInAdminUser.password
        }
        const response = await api
            .post('/api/auth/signinadmin')
            .send(newSignInAdmin)
            .expect(400)
            .expect('Content-Type', /application\/json/)
        expect(response.body.error).toBe('El usuario o la contraseña están incorrectos');
    });

    test('CP10 admin cannot login with wrong password', async () => {
        const newSignInAdmin = {
            email: singnInAdminUser.email,
            password: 'fdgs'
        }
        const response = await api
            .post('/api/auth/signinadmin')
            .send(newSignInAdmin)
            .expect(401)
            .expect('Content-Type', /application\/json/)
        expect(response.body.error).toBe('El correo electrónico o la contraseña no coinciden');
    });
});

afterAll(async () => {
    await User.deleteMany({});
    mongoose.connection.close();
    server.close();
});