const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

exports.uploadImage = async filePath => {
    return await cloudinary.uploader.upload(filePath, {
        folder: 'LSEC'
    });
}

exports.deleteImage = async id => {
    return await cloudinary.uploader.destroy(id);
}