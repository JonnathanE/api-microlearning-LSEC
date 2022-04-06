const formidable = require('formidable');
const _ = require('lodash');
const fs = require('fs');
const fse = require('fs-extra');

const { uploadImage, deleteImage } = require('../libs/cloudinary');
const { errorHandler } = require('../helpers/dberrorHandler');

/**
 * @module ImageController
 */

/**
 * Method that renders the lesson icon
 */
exports.lessonIcon = (req, res, next) => {
    // check if there is a saved icon
    if (req.lesson.icon.data) {
        res.set('Content-Type', req.lesson.icon.contentType);
        return res.send(req.lesson.icon.data);
    }
    next();
}

/**
 * Method that updates the icon of a lesson 
 */
exports.updateLessonIcon = async (req, res) => {
    try {
        // get the lesson object from the request
        let lesson = req.lesson;
        // check if an image was sent and save it in cloudinary
        if (req.files.icon) {
            // file size is checked
            if (req.files.icon.size > 1000000) {
                return res.status(400).json({ error: "La imagen debe tener un tamaño inferior a 1 MB." });
            }
            // the icon is stored in the object lesson as a buffer data type
            lesson.icon.data = fs.readFileSync(req.files.icon.tempFilePath);
            lesson.icon.contentType = req.files.icon.mimetype;
            await fse.remove(req.files.icon.tempFilePath);
        }
        // save to database
        await lesson.save();
        // returns a message in JSON
        return res.status(200).json({ message: 'Icono actualizado correctamente' });
    } catch (error) {
        console.log(error)
        return res.status(400).json({ error: "No se actualizó el icono" })
    }
}

/**
 * Method that renders the image of the learning capsule
 */
exports.microlearningImage = (req, res, next) => {
    // check if there is a saved image
    if (req.microlearning.image.data) {
        res.set('Content-Type', req.microlearning.image.contentType);
        return res.send(req.microlearning.image.data);
    }
    next();
}

/**
 * Method that updates the learning capsule image
 */
exports.updateMicrolearningImage = async (req, res) => {
    try {
        // get the microlearning object from the request
        let microlearning = req.microlearning;
        // check if an image was sent and save it in cloudinary
        let image;
        if (req.files.image) {
            const resultImage = await uploadImage(req.files.image.tempFilePath);
            image = {
                url: resultImage.secure_url,
                public_id: resultImage.public_id
            }
            await fse.remove(req.files.image.tempFilePath);
        }
        // check if you have the image url registered and delete it
        if (microlearning.image_url.public_id) {
            await deleteImage(microlearning.image_url.public_id);
        }
        // replace new image url
        microlearning.image_url = image;
        // save changes
        const microSave = await microlearning.save();
        // check if the changes were saved
        if (!microSave) return res.starus(400).json({ error: 'La imágen no se ha guardado' });
        // returns a message in JSON
        return res.status(200).json({ message: 'Imágen actualizado correctamente' });
    } catch (error) {
        return res.status(400).json({ error: 'No se pudo actualizar la imagen' });
    }
}

/**
 * Method that renders the gif of the learning capsule
 */
exports.microlearningGif = (req, res, next) => {
    // check if there is a saved gif
    if (req.microlearning.gif.data) {
        res.set('Content-Type', req.microlearning.gif.contentType);
        return res.send(req.microlearning.gif.data);
    }
    next();
}

/**
 * Method that updates the learning capsule gif
 */
exports.updateMicrolearningGif = async (req, res) => {
    try {
        // get the microlearning object from the request
        let microlearning = req.microlearning;
        // check if an gif was sent and save it in cloudinary
        let gif;
        if (req.files.gif) {
            const resultGif = await uploadImage(req.files.gif.tempFilePath);
            gif = {
                url: resultGif.secure_url,
                public_id: resultGif.public_id
            }
            await fse.remove(req.files.gif.tempFilePath);
        }
        // check if you have the gif url registered and delete it
        if (microlearning.gif_url.public_id) {
            await deleteImage(microlearning.gif_url.public_id);
        }
        // replace new gif url
        microlearning.gif_url = gif;
        // save changes
        const microSave = await microlearning.save();
        // check if the changes were saved
        if (!microSave) return res.starus(400).json({ error: 'El gif no se ha guardado' });
        // returns a message in JSON
        return res.status(200).json({ message: 'GIF actualizado correctamente' });
    } catch (error) {
        return res.status(400).json({ error: 'No se pudo actualizar el GIF' });
    }
}

/**
 * Method that renders the gif of the knowledge card
 */
exports.cardGif = (req, res, next) => {
    // check if there is a saved gif
    if (req.card.gif.data) {
        res.set('Content-Type', req.card.gif.contentType);
        return res.send(req.card.gif.data);
    }
    next();
}

/**
 * Method that updates the knowledge card gif
 */
exports.updateCardGif = async (req, res) => {
    try {
        // get the card object from the request
        let card = req.card;
        // check if an gif was sent and save it in cloudinary
        let gif;
        if (req.files.gif) {
            const resultGif = await uploadImage(req.files.gif.tempFilePath);
            gif = {
                url: resultGif.secure_url,
                public_id: resultGif.public_id
            }
            await fse.remove(req.files.gif.tempFilePath);
        }
        // check if you have the gif url registered and delete it
        if (card.gif_url.public_id) {
            await deleteImage(card.gif_url.public_id);
        }
        // replace new gif url
        card.gif_url = gif;
        // save changes
        const cardSave = await card.save();
        // check if the changes were saved
        if (!cardSave) return res.starus(400).json({ error: 'El gif no se ha guardado' });
        // returns a message in JSON
        return res.status(200).json({ message: 'GIF actualizado correctamente' });
    } catch (error) {
        return res.status(400).json({ error: 'No se pudo actualizar el GIF' });
    }
}