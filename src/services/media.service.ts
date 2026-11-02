import type { UploadedFile } from 'express-fileupload';
import type { Document } from 'mongoose';
import { UploadError } from '../errors/http-errors.js';
import { deleteImage, uploadImage } from '../libs/cloudinary.js';
import logger from '../libs/logger.js';
import type { Asset } from '../models/Asset.js';

/**
 * Deletes files from Cloudinary. A failure only leaves an orphan file, so it is logged and not propagated.
 */
export const removeAll = async (assets: Array<Partial<Asset> | undefined>) => {
    const ids = assets.map((asset) => asset?.public_id).filter((id): id is string => Boolean(id));
    const results = await Promise.allSettled(ids.map((id) => deleteImage(id)));
    results.forEach((result, index) => {
        if (result.status === 'rejected') logger.warn({ err: result.reason, id: ids[index] }, 'Could not delete asset');
    });
};

/**
 * Uploads files to Cloudinary. If one fails, the ones already uploaded are deleted.
 * @returns the assets by field name
 */
export const uploadAll = async <Field extends string>(
    files: Record<Field, UploadedFile>,
): Promise<Record<Field, Asset>> => {
    const fields = Object.keys(files) as Field[];
    const results = await Promise.allSettled(fields.map((field) => uploadImage(files[field].tempFilePath)));
    const assets = results.map((result) =>
        result.status === 'fulfilled' ? { url: result.value.secure_url, public_id: result.value.public_id } : undefined,
    );
    const failed = results.find((result) => result.status === 'rejected');
    if (failed) {
        logger.error({ err: failed.reason }, 'Could not upload asset');
        await removeAll(assets);
        throw new UploadError();
    }
    return Object.fromEntries(fields.map((field, index) => [field, assets[index]])) as Record<Field, Asset>;
};

/**
 * Runs an operation that saves uploaded assets. If it fails, the assets are deleted.
 */
export const saveOrRollback = async <Result>(assets: Record<string, Asset>, save: () => Promise<Result>) => {
    try {
        return await save();
    } catch (err) {
        await removeAll(Object.values(assets));
        throw err;
    }
};

/**
 * Replaces an asset of a document and deletes the previous one from Cloudinary
 * @param doc mongoose document
 * @param path field of the document that stores the asset
 * @param file uploaded file
 */
export const replaceAsset = async (doc: Document, path: string, file: UploadedFile) => {
    const previous: Partial<Asset> | undefined = doc.get(path);
    const previousId = previous?.public_id;
    const { asset } = await uploadAll({ asset: file });
    doc.set(path, asset);
    await saveOrRollback({ asset }, () => doc.save());
    await removeAll([{ public_id: previousId }]);
};
