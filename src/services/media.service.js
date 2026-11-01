const { uploadImage, deleteImage } = require('../libs/cloudinary');
const logger = require('../libs/logger');
const { UploadError } = require('../errors/http-errors');

/**
 * Deletes files from Cloudinary. A failure only leaves an orphan file, so it is logged and not propagated.
 * @param {Array<{public_id?: string}|undefined>} assets
 */
const removeAll = async (assets) => {
    const ids = assets.map((asset) => asset?.public_id).filter(Boolean);
    const results = await Promise.allSettled(ids.map((id) => deleteImage(id)));
    results.forEach((result, index) => {
        if (result.status === 'rejected') logger.warn({ err: result.reason, id: ids[index] }, 'Could not delete asset');
    });
};

/**
 * Uploads files to Cloudinary. If one fails, the ones already uploaded are deleted.
 * @param {Object} files uploaded files by field name
 * @returns {Promise<Object>} the assets ({ url, public_id }) by field name
 */
const uploadAll = async (files) => {
    const fields = Object.keys(files);
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
    return Object.fromEntries(fields.map((field, index) => [field, assets[index]]));
};

/**
 * Runs an operation that saves uploaded assets. If it fails, the assets are deleted.
 */
const saveOrRollback = async (assets, save) => {
    try {
        return await save();
    } catch (err) {
        await removeAll(Object.values(assets));
        throw err;
    }
};

/**
 * Replaces an asset of a document and deletes the previous one from Cloudinary
 * @param {Object} doc mongoose document
 * @param {string} path field of the document that stores the asset
 * @param {Object} file uploaded file
 */
const replaceAsset = async (doc, path, file) => {
    const previous = doc[path]?.public_id;
    const { asset } = await uploadAll({ asset: file });
    doc[path] = asset;
    await saveOrRollback({ asset }, () => doc.save());
    await removeAll([{ public_id: previous }]);
};

module.exports = { removeAll, uploadAll, saveOrRollback, replaceAsset };
