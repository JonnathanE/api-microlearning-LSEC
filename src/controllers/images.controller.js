const formidable = require('formidable');
const _ = require('lodash');
const fs = require('fs');

const Lessons = require('../models/Lesson');
const Microlearning = require('../models/Microlearning');
const { errorHandler } = require('../helpers/dberrorHandler');

exports.lessonIcon = (req, res, next) => {
    if (req.lesson.icon.data) {
        res.set('Content-Type', req.lesson.icon.contentType);
        return res.send(req.lesson.icon.data);
    }
    next();
}

exports.updateLessonIcon = (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, async (err, fields, files) => {
        if (err) return res.status(400).json({ error: "No se pudo cargar la imagen" });

        let lesson = req.lesson;

        if (files.icon) {
            if (files.icon.size > 1000000) {
                return res.status(400).json({ error: "La imagen debe tener un tamaño inferior a 1 MB." });
            }
            lesson.icon.data = fs.readFileSync(files.icon.path);
            lesson.icon.contentType = files.icon.type;
        }

        await lesson.save((err, result) => {
            if (err) return res.starus(400).json({ error: errorHandler(err) });
            res.json(result);
        });
    });
}

exports.microlearningImage = (req, res, next) => {
    if (req.microlearning.image.data) {
        res.set('Content-Type', req.microlearning.image.contentType);
        return res.send(req.microlearning.image.data);
    }
    next();
}

exports.updateMicrolearningImage = (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, async (err, fields, files) => {
        if (err) return res.status(400).json({ error: "No se pudo cargar la imagen" });

        let microlearning = req.microlearning;

        if (files.image) {
            if (files.image.size > 9000000) {
                return res.status(400).json({ error: "La imagen debe tener un tamaño inferior a 9 MB." });
            }
            microlearning.image.data = fs.readFileSync(files.image.path);
            microlearning.image.contentType = files.image.type;
        }

        await microlearning.save((err, result) => {
            if (err) return res.starus(400).json({ error: errorHandler(err) });
            res.status(200).json(result);
        });
    });
}

exports.microlearningGif = (req, res, next) => {
    if (req.microlearning.gif.data) {
        res.set('Content-Type', req.microlearning.gif.contentType);
        return res.send(req.microlearning.gif.data);
    }
    next();
}

exports.updateMicrolearningGif = (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, async (err, fields, files) => {
        if (err) return res.status(400).json({ error: "No se pudo cargar la imagen" });

        let microlearning = req.microlearning;

        if (files.gif) {
            if (files.gif.size > 9000000) {
                return res.status(400).json({ error: "La imagen debe tener un tamaño inferior a 9 MB." });
            }
            microlearning.gif.data = fs.readFileSync(files.gif.path);
            microlearning.gif.contentType = files.gif.type;
        }

        await microlearning.save((err, result) => {
            if (err) return res.starus(400).json({ error: errorHandler(err) });
            res.json(result);
        });
    });
}