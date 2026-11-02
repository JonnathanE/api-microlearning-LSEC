import mongoose from 'mongoose';
import { afterAll, beforeAll, vi } from 'vitest';
import { connectDatabase, disconnectDatabase } from '../src/config/database.js';
import * as roleService from '../src/services/role.service.js';

// Cloudinary is mocked so the tests do not need real credentials or network access
vi.mock('../src/libs/cloudinary.js', () => ({
    uploadImage: vi.fn(async () => {
        const id = `LSEC/test-${Date.now()}-${Math.round(Math.random() * 1e6)}`;
        return { secure_url: `https://res.cloudinary.com/test/image/upload/${id}`, public_id: id };
    }),
    deleteImage: vi.fn(async () => ({ result: 'ok' })),
}));

beforeAll(async () => {
    await connectDatabase();
    // every test file starts with an empty database
    const collections = await mongoose.connection.listCollections();
    await Promise.all(collections.map(({ name }) => mongoose.connection.collection(name).deleteMany({})));
    await roleService.ensureRoles();
});

afterAll(disconnectDatabase);
