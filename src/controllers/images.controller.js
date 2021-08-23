const formidable = require('formidable');
const _ = require('lodash');
const fs = require('fs');

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
        } else {
            return res.status(400).json({ error: 'Debe de enviar un icono' });
        }

        await lesson.save((err, result) => {
            if (err) return res.starus(400).json({ error: errorHandler(err) });
            res.status(200).json({message: 'Icono actualizado correctamente'});
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
        } else {
            return res.status(400).json({ error: 'Debe de enviar una imagen' });
        }

        await microlearning.save((err, result) => {
            if (err) return res.starus(400).json({ error: 'La imágen no se ha guardado' });
            res.status(200).json({message: 'Imágen actualizado correctamente'});
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
        } else {
            return res.status(400).json({ error: 'Debe de enviar un gif' });
        }

        await microlearning.save((err, result) => {
            if (err) return res.starus(400).json({ error: 'El gif no se ha guardado' });
            res.status(200).json({message: 'Gif actualzado correctamente'});
        });
    });
}

exports.cardGif = (req, res, next) => {
    if (req.card.gif.data) {
        res.set('Content-Type', req.card.gif.contentType);
        return res.send(req.card.gif.data);
    }
    next();
}

exports.updateCardGif = (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, async (err, fields, files) => {
        if (err) return res.status(400).json({ error: "No se pudo cargar la imagen" });

        let card = req.card;

        if (files.gif) {
            if (files.gif.size > 9000000) {
                return res.status(400).json({ error: "El gif debe tener un tamaño inferior a 9 MB." });
            }
            card.gif.data = fs.readFileSync(files.gif.path);
            card.gif.contentType = files.gif.type;
        } else {
            return res.status(400).json({ error: 'Debe de enviar un gif' });
        }

        await card.save((err, result) => {
            if (err) return res.starus(400).json({ error: 'El gif no se ha guardado' });
            res.status(200).json({message: 'Gif actualizado correctamente'});
        });
    });
}