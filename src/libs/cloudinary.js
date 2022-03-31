const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: "dqynubmo1",
    api_key: "344821411629129",
    api_secret: "ifRvbW0L3jXFU75Br41DQkhJxHw"
});

exports.uploadImage = async filePath => {
    return await cloudinary.uploader.upload(filePath, {
        folder: 'prueba'
    });
}

exports.deleteImage = async id => {
    return await cloudinary.uploader.destroy(id);
}