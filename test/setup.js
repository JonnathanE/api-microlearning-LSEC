// Cloudinary is mocked so the tests do not need real credentials or network access
jest.mock('../src/libs/cloudinary', () => ({
    uploadImage: jest.fn(async filePath => {
        const id = `LSEC/test-${Date.now()}-${Math.round(Math.random() * 1e6)}`;
        return { secure_url: `https://res.cloudinary.com/test/image/upload/${id}`, public_id: id };
    }),
    deleteImage: jest.fn(async () => ({ result: 'ok' }))
}));
