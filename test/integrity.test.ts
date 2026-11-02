import supertest, { type Test } from 'supertest';
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';
import app from '../src/app.js';
import { deleteImage, uploadImage } from '../src/libs/cloudinary.js';

import Card from '../src/models/Card.js';
import Learn from '../src/models/Learn.js';
import Lesson from '../src/models/Lesson.js';
import Microlearning from '../src/models/Microlearning.js';
import Module from '../src/models/Module.js';

import { adminUser, createAdmin, student } from './helpers.js';

const api = supertest(app);
const PNG = 'test/fixtures/lsec.png';
const UNKNOWN_ID = '507f1f77bcf86cd799439011';

let token: string;
let moduleNumber = 0;

const auth = (request: Test) => request.set('authorization', `Bearer ${token}`);

const createModule = () => {
    moduleNumber += 1;
    return Module.create({ number: moduleNumber, name: `module ${moduleNumber}` });
};

const createLesson = async (module: { id: string }) => {
    const { body } = await auth(api.post('/api/lesson'))
        .field('name', 'lesson')
        .field('module', module.id)
        .attach('icon', PNG)
        .expect(201);
    return body;
};

const createMicro = async (lesson: { _id: string }) => {
    const { body } = await auth(api.post('/api/micro'))
        .field('title', 'micro')
        .field('lesson', lesson._id)
        .attach('image', PNG)
        .attach('gif', PNG)
        .expect(201);
    return body;
};

const createCard = async (lesson: { _id: string }) => {
    const { body } = await auth(api.post('/api/card'))
        .field('question', 'question')
        .field('lesson', lesson._id)
        .field('correctAnswer', 'yes')
        .field('wrongAnswer', 'no')
        .attach('gif', PNG)
        .expect(201);
    return body;
};

beforeAll(async () => {
    await createAdmin();
    const { body } = await api.post('/api/auth/signin').send(adminUser).expect(200);
    token = body.token;
});

beforeEach(() => {
    vi.clearAllMocks();
});

describe('deleting content with children', () => {
    test('a module with lessons cannot be deleted', async () => {
        const module = await createModule();
        const lesson = await createLesson(module);
        const { body } = await auth(api.delete(`/api/module/${module.id}`)).expect(409);
        expect(body.code).toBe('CONFLICT');
        await auth(api.delete(`/api/lesson/${lesson._id}`)).expect(204);
        await auth(api.delete(`/api/module/${module.id}`)).expect(204);
    });

    test('a lesson with microlearning or cards cannot be deleted', async () => {
        const lesson = await createLesson(await createModule());
        const micro = await createMicro(lesson);
        await auth(api.delete(`/api/lesson/${lesson._id}`)).expect(409);
        await auth(api.delete(`/api/micro/${micro._id}`)).expect(204);
        const card = await createCard(lesson);
        await auth(api.delete(`/api/lesson/${lesson._id}`)).expect(409);
        await auth(api.delete(`/api/card/${card._id}`)).expect(204);
        await auth(api.delete(`/api/lesson/${lesson._id}`)).expect(204);
        expect(await Lesson.exists({ _id: lesson._id })).toBeNull();
    });

    test('deleting a lesson removes it from the progress of the students', async () => {
        const lesson = await createLesson(await createModule());
        const { body: session } = await api.post('/api/auth/signup').send(student).expect(201);
        const studentAuth = (request: Test) => request.set('authorization', `Bearer ${session.token}`);
        await studentAuth(api.put(`/api/home/complete/lesson/${lesson._id}`)).expect(200);
        const before = await studentAuth(api.get('/api/home/complete/learn')).expect(200);
        expect(before.body.lesson).toEqual([lesson._id]);
        await auth(api.delete(`/api/lesson/${lesson._id}`)).expect(204);
        const after = await studentAuth(api.get('/api/home/complete/learn')).expect(200);
        expect(after.body.lesson).toEqual([]);
        expect(await Learn.countDocuments({ lesson: lesson._id })).toBe(0);
    });
});

describe('Cloudinary files', () => {
    test('deleting a document deletes its files', async () => {
        const lesson = await createLesson(await createModule());
        const micro = await createMicro(lesson);
        const card = await createCard(lesson);
        vi.mocked(deleteImage).mockClear();
        await auth(api.delete(`/api/micro/${micro._id}`)).expect(204);
        expect(
            vi
                .mocked(deleteImage)
                .mock.calls.map(([id]) => id)
                .sort(),
        ).toEqual([micro.image_url.public_id, micro.gif_url.public_id].sort());
        vi.mocked(deleteImage).mockClear();
        await auth(api.delete(`/api/card/${card._id}`)).expect(204);
        expect(deleteImage).toHaveBeenCalledWith(card.gif_url.public_id);
        vi.mocked(deleteImage).mockClear();
        await auth(api.delete(`/api/lesson/${lesson._id}`)).expect(204);
        expect(deleteImage).toHaveBeenCalledWith(lesson.icon_url.public_id);
    });

    test('replacing a file deletes the previous one', async () => {
        const lesson = await createLesson(await createModule());
        await auth(api.put(`/api/lesson/icon/update/${lesson._id}`))
            .attach('icon', PNG)
            .expect(200);
        expect(deleteImage).toHaveBeenCalledWith(lesson.icon_url.public_id);
        const updated = await Lesson.findById(lesson._id);
        expect(updated!.icon_url!.public_id).not.toBe(lesson.icon_url.public_id);
    });

    test('nothing is uploaded when the reference does not exist', async () => {
        const { body } = await auth(api.post('/api/micro'))
            .field('title', 'micro')
            .field('lesson', UNKNOWN_ID)
            .attach('image', PNG)
            .attach('gif', PNG)
            .expect(400);
        expect(body.error).toBe('La lección indicada no existe');
        expect(uploadImage).not.toHaveBeenCalled();
    });

    test('if an upload fails, the other file is deleted and nothing is saved', async () => {
        const lesson = await createLesson(await createModule());
        vi.clearAllMocks();
        vi.mocked(uploadImage).mockRejectedValueOnce(new Error('cloudinary down'));
        const { body } = await auth(api.post('/api/micro'))
            .field('title', 'failed upload')
            .field('lesson', lesson._id)
            .attach('image', PNG)
            .attach('gif', PNG)
            .expect(502);
        expect(body.code).toBe('UPLOAD_FAILED');
        expect(deleteImage).toHaveBeenCalledTimes(1);
        expect(await Microlearning.exists({ title: 'failed upload' })).toBeNull();
    });

    test('the icon route redirects to Cloudinary', async () => {
        const lesson = await createLesson(await createModule());
        const { headers } = await api.get(`/api/lesson/icon/${lesson._id}`).expect(302);
        expect(headers.location).toBe(lesson.icon_url.url);
    });
});

describe('references and duplicates', () => {
    test('a lesson needs an existing module', async () => {
        await auth(api.post('/api/lesson'))
            .field('name', 'lesson')
            .field('module', UNKNOWN_ID)
            .attach('icon', PNG)
            .expect(400);
        const lesson = await createLesson(await createModule());
        await auth(api.put(`/api/lesson/${lesson._id}`))
            .send({ module: UNKNOWN_ID })
            .expect(400);
    });

    test('a card needs an existing lesson', async () => {
        await auth(api.post('/api/card'))
            .field('question', 'question')
            .field('lesson', UNKNOWN_ID)
            .field('correctAnswer', 'yes')
            .field('wrongAnswer', 'no')
            .attach('gif', PNG)
            .expect(400);
        expect(await Card.countDocuments({ question: 'question', lesson: UNKNOWN_ID })).toBe(0);
    });

    test('a duplicated module returns a 409', async () => {
        const module = await createModule();
        await Module.init();
        const { body } = await auth(api.post('/api/module'))
            .send({ number: module.number, name: 'another name' })
            .expect(409);
        expect(body.error).toBe('El número ya existe');
    });

    test('valid ids that do not exist return a 404', async () => {
        for (const url of ['module', 'lesson', 'micro', 'card']) {
            const { body } = await api.get(`/api/${url}/${UNKNOWN_ID}`).expect(404);
            expect(body.code).toBe('NOT_FOUND');
        }
    });
});

describe('listings', () => {
    test('only whitelisted fields can be used to sort', async () => {
        await api.get('/api/lesson?sortBy=name&order=desc').expect(200);
        await api.get('/api/lesson?sortBy=password').expect(400);
        await api.get('/api/lesson?order=sideways').expect(400);
    });

    test('home only lists the modules that have lessons, in order', async () => {
        await Promise.all([Lesson.deleteMany({}), Module.deleteMany({})]);
        const empty = await createModule();
        const second = await createModule();
        const first = await Module.create({ number: 0, name: 'first' });
        await createLesson(second);
        await createLesson(first);
        const { body } = await api.get('/api/home/modules').expect(200);
        expect(body.map((module: { _id: string }) => module._id)).toEqual([first.id, second.id]);
        expect(body.map((module: { _id: string }) => module._id)).not.toContain(empty.id);
    });

    test('the paginated content of a lesson returns one item, or a 404 when it is empty', async () => {
        const lesson = await createLesson(await createModule());
        await api.get(`/api/home/card/${lesson._id}?page=1`).expect(404);
        await api.get(`/api/home/card/${lesson._id}`).expect(200);
        await createCard(lesson);
        await createCard(lesson);
        const { body } = await api.get(`/api/home/card/${lesson._id}?page=2`).expect(200);
        expect(body.docs).toHaveLength(1);
        expect(body.totalDocs).toBe(2);
        await api.get(`/api/home/learn/${lesson._id}?page=abc`).expect(400);
    });
});
