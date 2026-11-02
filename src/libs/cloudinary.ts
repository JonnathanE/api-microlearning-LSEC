import { v2 as cloudinary } from 'cloudinary';
import env from '../config/env.js';

cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
});

export const uploadImage = (filePath: string) => cloudinary.uploader.upload(filePath, { folder: 'LSEC' });

export const deleteImage = (id: string) => cloudinary.uploader.destroy(id);
