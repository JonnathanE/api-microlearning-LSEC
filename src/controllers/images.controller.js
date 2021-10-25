const formidable = require('formidable');
const _ = require('lodash');
const fs = require('fs');

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
exports.updateLessonIcon = (req, res) => {
    // a formidable object is created
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    // the request file is extracted
    form.parse(req, async (err, fields, files) => {
        if (err) return res.status(400).json({ error: "No se pudo cargar la imagen" });
        // get the lesson object from the request
        let lesson = req.lesson;
        // check if the new icon exists
        if (files.icon) {
            // the size of the new icon is checked
            if (files.icon.size > 1000000) {
                return res.status(400).json({ error: "La imagen debe tener un tamaño inferior a 1 MB." });
            }
            // the new icon is replaced in the lesson object
            lesson.icon.data = fs.readFileSync(files.icon.path);
            lesson.icon.contentType = files.icon.type;
        } else {
            return res.status(400).json({ error: 'Debe de enviar un icono' });
        }
        // the lesson is updated in the database
        await lesson.save((err, result) => {
            if (err) return res.starus(400).json({ error: errorHandler(err) });
            // returns a message in JSON
            res.status(200).json({ message: 'Icono actualizado correctamente' });
        });
    });
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
exports.updateMicrolearningImage = (req, res) => {
    // a formidable object is created
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    // the request file is extracted
    form.parse(req, async (err, fields, files) => {
        if (err) return res.status(400).json({ error: "No se pudo cargar la imagen" });
        // get the microlearning object from the request
        let microlearning = req.microlearning;
        // check if the new image exists
        if (files.image) {
            // the size of the new image is checked
            if (files.image.size > 9000000) {
                return res.status(400).json({ error: "La imagen debe tener un tamaño inferior a 9 MB." });
            }
            // the new image is replaced in the microlearning object
            microlearning.image.data = fs.readFileSync(files.image.path);
            microlearning.image.contentType = files.image.type;
        } else {
            return res.status(400).json({ error: 'Debe de enviar una imagen' });
        }
        // the microlearning is updated in the database
        await microlearning.save((err, result) => {
            if (err) return res.starus(400).json({ error: 'La imágen no se ha guardado' });
            // returns a message in JSON
            res.status(200).json({ message: 'Imágen actualizado correctamente' });
        });
    });
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
exports.updateMicrolearningGif = (req, res) => {
    // a formidable object is created
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    // the request file is extracted
    form.parse(req, async (err, fields, files) => {
        if (err) return res.status(400).json({ error: "No se pudo cargar la imagen" });
        // get the microlearning object from the request
        let microlearning = req.microlearning;
        // check if the new gif exists
        if (files.gif) {
            if (files.gif.size > 9000000) {
                return res.status(400).json({ error: "La imagen debe tener un tamaño inferior a 9 MB." });
            }
            // the new gif is replaced in the microlearning object
            microlearning.gif.data = fs.readFileSync(files.gif.path);
            microlearning.gif.contentType = files.gif.type;
        } else {
            return res.status(400).json({ error: 'Debe de enviar un gif' });
        }
        // the microlearning is updated in the database
        await microlearning.save((err, result) => {
            if (err) return res.starus(400).json({ error: 'El gif no se ha guardado' });
            // returns a message in JSON
            res.status(200).json({ message: 'Gif actualzado correctamente' });
        });
    });
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
exports.updateCardGif = (req, res) => {
    // a formidable object is created
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    // the request file is extracted
    form.parse(req, async (err, fields, files) => {
        if (err) return res.status(400).json({ error: "No se pudo cargar la imagen" });
        // get the card object from the request
        let card = req.card;
        // check if the new gif exists
        if (files.gif) {
            if (files.gif.size > 9000000) {
                return res.status(400).json({ error: "El gif debe tener un tamaño inferior a 9 MB." });
            }
            // // the new gif is replaced in the card object
            card.gif.data = fs.readFileSync(files.gif.path);
            card.gif.contentType = files.gif.type;
        } else {
            return res.status(400).json({ error: 'Debe de enviar un gif' });
        }
        // the card is updated in the database
        await card.save((err, result) => {
            if (err) return res.starus(400).json({ error: 'El gif no se ha guardado' });
            // returns a message in JSON
            res.status(200).json({ message: 'Gif actualizado correctamente' });
        });
    });
}