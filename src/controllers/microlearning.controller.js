'use strict';
const formidable = require('formidable');
const fs = require('fs');

const Micro = require('../models/Microlearning');
const { errorHandler } = require('../helpers/dberrorHandler')

class Microlearning {
    create = async (req, res) => {
        let form = new formidable.IncomingForm();
        form.keepExtensions = true;
        form.parse(req, async (err, fields, files) => {

            if (err) return res.status(400).json({ error: 'No se pudo cargar la imagen' });

            let micro = new Micro(fields);

            if (files.image) {
                if (files.image.size > 9000000) {
                    return res.status(400).json({ error: 'La imagen debe tener un tamaño inferior a 9 MB.' });
                }
                micro.image.data = fs.readFileSync(files.image.path);
                micro.image.contentType = files.image.type;
            }

            if (files.gif) {
                if (files.gif.size > 9000000) {
                    return res.status(400).json({ error: 'El GIF debe tener un tamaño inferior a 9 MB.' });
                }
                micro.gif.data = fs.readFileSync(files.gif.path);
                micro.gif.contentType = files.gif.type;
            }

            await micro.save((err, result) => {
                if (err) return res.status(400).json({ error: errorHandler(err) });
                res.json(result);
            });
        });
    }

    getAll = async (req, res) => {
        let order = req.query.order ? req.query.order : 'asc'; // variable to sort the results; ascending by default
        let sortBy = req.query.sortBy ? req.query.sortBy : 'title'; // filter

        await Micro.find()
            .select(['-image', '-gif'])
            .populate('lesson')
            .sort([[sortBy, order]])
            .exec((err, micro) => {
                if (err) return res.status(400).json({ error: 'Microcontenidos no encontrados' });
                res.status(200).json(micro);
            });
    }

    getById = (req, res) => {
        req.microlearning.image = undefined;
        req.microlearning.gif = undefined;
        return res.status(200).json(req.microlearning);
    }

    remove = (req, res) => {
        let microlearning = req.microlearning;
        microlearning.remove((err, deleteMicro) => {
            if (err) return res.status(400).json({ error: errorHandler(err) });
            res.status(200).json({ message: 'El microcontenido se eliminó con éxito' })
        });
    }

    update = (req, res) => {
        const { title, lesson } = req.body;
        let microlearning = req.microlearning;
        microlearning.title = title;
        microlearning.lesson = lesson;
        microlearning.save((err, data) => {
            if (err) return res.status(400).json({ error: errorHandler(err) });
            res.status(200).json({ message: 'El microcontenido se actualizado correctamente' });
        });
    }

    byId = async (req, res, next, id) => {
        await Micro.findById(id)
            .populate('lesson', 'name')
            .exec((err, micro) => {
                if (err || !micro) return res.status(400).json({ err: 'El microcontenido no se encontró o no existe' });
                req.microlearning = micro;
                next();
            });
    }
}

module.exports = Microlearning;