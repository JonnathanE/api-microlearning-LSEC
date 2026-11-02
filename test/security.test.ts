import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import supertest from 'supertest';
import { beforeAll, describe, expect, test } from 'vitest';
import app from '../src/app.js';

import Learn from '../src/models/Learn.js';
import Lesson from '../src/models/Lesson.js';
import type { IRole } from '../src/models/Role.js';
import User, { type UserDocument } from '../src/models/User.js';

import { adminUser, createAdmin, student } from './helpers.js';

const api = supertest(app);

const signin = async ({ email, password }: { email: string; password: string }) => {
    const { body } = await api.post('/api/auth/signin').send({ email, password }).expect(200);
    return body.token;
};

let adminToken: string;
let admin: UserDocument;
let studentToken: string;
let studentId: string;

beforeAll(async () => {
    admin = await createAdmin();
    adminToken = await signin(adminUser);
    await api.post('/api/auth/signup').send(student).expect(201);
    studentToken = await signin(student);
    studentId = (await User.findOne({ email: student.email }))!.id;
});

describe('signup', () => {
    test('the roles sent in the body are ignored', async () => {
        const attacker = { name: 'attacker', email: 'attacker@test.com', password: 'password1234', roles: ['admin'] };
        await api.post('/api/auth/signup').send(attacker).expect(201);
        const user = await User.findOne({ email: attacker.email }).populate('roles');
        expect(user!.roles.map((role) => (role as IRole).name)).toEqual(['student']);
        await api
            .post('/api/auth/signinadmin')
            .send({ email: attacker.email, password: attacker.password })
            .expect(403);
    });

    test('short passwords and invalid emails are rejected with details', async () => {
        const { body } = await api
            .post('/api/auth/signup')
            .send({ name: 'x', email: 'not-an-email', password: '123' })
            .expect(400);
        expect(body.code).toBe('VALIDATION_ERROR');
        expect(body.details.map((detail: { field: string }) => detail.field)).toEqual(['email', 'password']);
    });

    test('operators cannot be injected in the credentials', async () => {
        await api
            .post('/api/auth/signin')
            .send({ email: { $ne: null }, password: { $ne: null } })
            .expect(400);
    });
});

describe('passwords', () => {
    test('they are stored with argon2id', async () => {
        const user = await User.findOne({ email: student.email }).select('+password');
        expect(user!.password).toMatch(/^\$argon2id\$/);
    });

    test('the API never returns them', async () => {
        const { body: users } = await api.get('/api/user').set('authorization', `Bearer ${adminToken}`).expect(200);
        expect(users.length).toBeGreaterThan(0);
        for (const user of users) expect(user).not.toHaveProperty('password');
        expect(users[0].roles[0]).toHaveProperty('name');
    });

    test('a changed password works and the previous one does not', async () => {
        const { email } = await User.create({ name: 'temp', email: 'temp@test.com', password: 'password1234' });
        const token = await signin({ email, password: 'password1234' });
        const { id } = (await User.findOne({ email }))!;
        await api
            .put(`/api/user/${id}`)
            .set('authorization', `Bearer ${token}`)
            .send({ password: 'newpassword1234' })
            .expect(200);
        await signin({ email, password: 'newpassword1234' });
        await api.post('/api/auth/signin').send({ email, password: 'password1234' }).expect(401);
    });
});

describe('users', () => {
    test('a student cannot update another user', async () => {
        await api
            .put(`/api/user/${admin.id}`)
            .set('authorization', `Bearer ${studentToken}`)
            .send({ name: 'hacked' })
            .expect(403);
        expect((await User.findById(admin.id))!.name).toBe(adminUser.name);
    });

    test('a student can update their own name but not their roles', async () => {
        const { body } = await api
            .put(`/api/user/${studentId}`)
            .set('authorization', `Bearer ${studentToken}`)
            .send({ name: 'nuevo', roles: ['admin'] })
            .expect(200);
        expect(body.name).toBe('nuevo');
        expect(body.roles.map((role: { name: string }) => role.name)).toEqual(['student']);
    });

    test('only an admin can change the roles of another user', async () => {
        await api
            .put(`/api/user/${studentId}/roles`)
            .set('authorization', `Bearer ${studentToken}`)
            .send({ roles: ['admin'] })
            .expect(403);
        await api
            .put(`/api/user/${admin.id}/roles`)
            .set('authorization', `Bearer ${adminToken}`)
            .send({ roles: ['student'] })
            .expect(403);
        const { body } = await api
            .put(`/api/user/${studentId}/roles`)
            .set('authorization', `Bearer ${adminToken}`)
            .send({ roles: ['student', 'moderator'] })
            .expect(200);
        expect(body.roles.map((role: { name: string }) => role.name).sort()).toEqual(['moderator', 'student']);
    });

    test('unknown roles are rejected', async () => {
        await api
            .put(`/api/user/${studentId}/roles`)
            .set('authorization', `Bearer ${adminToken}`)
            .send({ roles: ['superadmin'] })
            .expect(400);
    });

    test('deleting a user also deletes their progress', async () => {
        const user = await User.create({ name: 'gone', email: 'gone@test.com', password: 'password1234' });
        await Learn.create({ user: user._id });
        await api.delete(`/api/user/${user.id}`).set('authorization', `Bearer ${adminToken}`).expect(204);
        expect(await Learn.exists({ user: user._id })).toBeNull();
    });
});

describe('tokens', () => {
    test('a malformed authorization header is rejected', async () => {
        await api.get('/api/user/find').set('authorization', studentToken).expect(401);
        await api.get('/api/user/find').set('authorization', `Basic ${studentToken}`).expect(401);
    });

    test('a token of a deleted user is rejected instead of failing with a 500', async () => {
        const user = await User.create({ name: 'old', email: 'old@test.com', password: 'password1234' });
        const token = await signin({ email: user.email, password: 'password1234' });
        await user.deleteOne();
        await api.get('/api/module/').expect(200);
        await api.get('/api/user').set('authorization', `Bearer ${token}`).expect(401);
    });
});

describe('uploads', () => {
    const createLessonRequest = () =>
        api
            .post('/api/lesson')
            .set('authorization', `Bearer ${adminToken}`)
            .field('name', 'lesson')
            .field('module', '507f1f77bcf86cd799439011');

    test('non image files are rejected', async () => {
        const { body } = await createLessonRequest()
            .attach('icon', Buffer.from('<script></script>'), { filename: 'x.html', contentType: 'text/html' })
            .expect(400);
        expect(body.details[0].field).toBe('icon');
    });

    test('icons larger than 1 MB are rejected', async () => {
        await createLessonRequest()
            .attach('icon', Buffer.alloc(1000001), { filename: 'big.png', contentType: 'image/png' })
            .expect(413);
    });

    test('a request without files gets a 400 instead of failing', async () => {
        await createLessonRequest().expect(400);
    });

    test('temporary files are removed', async () => {
        const dir = path.join(os.tmpdir(), 'lsec-uploads');
        await createLessonRequest().attach('icon', 'test/fixtures/lsec.png').expect(400);
        await new Promise((resolve) => setTimeout(resolve, 100));
        expect(fs.existsSync(dir) ? fs.readdirSync(dir) : []).toEqual([]);
        expect(await Lesson.countDocuments()).toBe(0);
    });
});

describe('app', () => {
    test('health reports the database state', async () => {
        const { body } = await api.get('/health').expect(200);
        expect(body.status).toBe('ok');
    });

    test('unknown routes return a JSON 404', async () => {
        const { body } = await api.get('/api/unknown').expect(404);
        expect(body.code).toBe('NOT_FOUND');
    });

    test('a malformed JSON body returns a 400', async () => {
        const { body } = await api
            .post('/api/auth/signin')
            .set('Content-Type', 'application/json')
            .send('{ not json')
            .expect(400);
        expect(body.code).toBe('BAD_REQUEST');
    });

    test('only the configured origins are allowed', async () => {
        const allowed = await api.get('/api/module').set('Origin', 'http://localhost:3000').expect(200);
        expect(allowed.headers['access-control-allow-origin']).toBe('http://localhost:3000');
        const denied = await api.get('/api/module').set('Origin', 'https://evil.example').expect(200);
        expect(denied.headers['access-control-allow-origin']).toBeUndefined();
    });

    test('the OpenAPI documentation is served', async () => {
        await api.get('/docs/').expect(200).expect('Content-Type', /html/);
    });
});
