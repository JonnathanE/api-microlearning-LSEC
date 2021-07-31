'use strict';
const formidable = require('formidable');
const _ = require('lodash');
const fs = require('fs');

const Lessons = require('../models/Lesson');
const { errorHandler } = require('../helpers/dberrorHandler');

class Lesson {
    create = async (req, res) => {
        let form = new formidable.IncomingForm();
        form.keepExtensions = true;
        form.parse(req, async (err, fields, files) => {
            if (err) return res.status(400).json({ error: "No se pudo cargar la imagen" });

            const { name, module } = fields;
            let lesson = new Lessons(fields);

            if (files.icon) {
                if (files.icon.size > 1000000) {
                    return res.status(400).json({ error: "La imagen debe tener un tamaño inferior a 1 MB." });
                }
                lesson.icon.data = fs.readFileSync(files.icon.path);
                lesson.icon.contentType = files.icon.type;
            }

            await lesson.save((err, result) => {
                if (err) return res.status(400).json({ error: 'No se ha creado' });
                result.icon = undefined;
                res.status(200).json(result);
            });
        });
    }

    getAll = async (req, res) => {
        let order = req.query.order ? req.query.order : 'asc'; // variable to sort the results; ascending by default
        let sortBy = req.query.sortBy ? req.query.sortBy : 'name'; // filter

        await Lessons.find()
            .select("-icon")
            .populate("module")
            .sort([[sortBy, order]])
            .exec((err, lesson) => {
                if (err) {
                    return res.status(400).json({ error: "Lecciones no encontrados" });
                }
                res.json(lesson);
            });
    }

    getById = (req, res) => {
        req.lesson.icon = undefined;
        return res.status(200).json(req.lesson);
    }

    remove = (req, res) => {
        let lesson = req.lesson;
        lesson.remove((err, deleteLesson) => {
            if (err) return res.status(400).json({ error: errorHandler(err) });
            res.json({ message: "La lección se eliminó con éxito" });
        });
    }

    update = (req, res) => {
        const { name, module } = req.body;
        let lesson = req.lesson;
        lesson.name = name;
        lesson.module = module;
        lesson.save((err, data) => {
            if (err) return res.status(400).json({ error: errorHandler(err) });
            res.status(200).json({ message: 'Lección actualizado correctamente' });
        });
    }

    byId = async (req, res, next, id) => {
        await Lessons.findById(id)
            .populate("module")
            .exec((err, lesson) => {
                if (err || !lesson) {
                    return res.status(400).json({ error: "La lección no se encontró o no existe" });
                }
                req.lesson = lesson;
                next();
            });
    }
}

module.exports = Lesson;