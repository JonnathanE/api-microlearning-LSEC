const cloudinary = require('cloudinary').v2;
const env = require('../config/env');

cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
});

exports.uploadImage = (filePath) => cloudinary.uploader.upload(filePath, { folder: 'LSEC' });

exports.deleteImage = (id) => cloudinary.uploader.destroy(id);
