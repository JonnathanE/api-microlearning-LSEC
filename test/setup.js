const mongoose = require('mongoose');
const { connectDatabase, disconnectDatabase } = require('../src/config/database');
const roleService = require('../src/services/role.service');

// Cloudinary is mocked so the tests do not need real credentials or network access
jest.mock('../src/libs/cloudinary', () => ({
    uploadImage: jest.fn(async () => {
        const id = `LSEC/test-${Date.now()}-${Math.round(Math.random() * 1e6)}`;
        return { secure_url: `https://res.cloudinary.com/test/image/upload/${id}`, public_id: id };
    }),
    deleteImage: jest.fn(async () => ({ result: 'ok' })),
}));

beforeAll(async () => {
    await connectDatabase();
    // every test file starts with an empty database
    const collections = await mongoose.connection.db.collections();
    await Promise.all(collections.map((collection) => collection.deleteMany({})));
    await roleService.ensureRoles();
});

afterAll(disconnectDatabase);
