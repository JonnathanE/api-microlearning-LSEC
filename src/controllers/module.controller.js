'use strict';
const Modules = require('../models/Module');
const { errorHandler } = require('../helpers/dberrorHandler');

class Module {
    create = async (req, res) => {
        const modules = new Modules(req.body);
        await modules.save((err, data) => {
            if (err) return res.status(400).json({ error: errorHandler(err) });
            res.status(200).json({ data });
        });
    }

    getAll = async (req, res) => {
        await Modules.find().sort({number: 1}).exec((err, data) => {
            if (err) return res.status(400).json({ error: errorHandler(err) });
            res.status(200).json(data);
        });
    }

    getById = async (req, res) => {
        return res.status(200).json(req.module);
    }

    remove = async (req, res) => {
        let module = req.module;
        module.remove((err, data) => {
            if (err) return res.status(400).json({ error: errorHandler(err) });
            res.status(200).json({ message: 'Modulo eliminado correctamente' });
        });
    }

    update = async (req, res) => {
        const { number, name } = req.body;
        let module = req.module;
        if (number) module.number = number;
        if (name) module.name = name;
        module.save((err, data) => {
            if (err) return res.status(400).json({ error: errorHandler(err) });
            res.status(200).json({ message: 'Modulo actualizado correctamente' });
        });
    }

    byId = async (req, res, next, id) => {
        await Modules.findById(id).exec((err, data) => {
            if (err || !data) return res.status(400).json({ error: 'El modulo no se encontró o no existe' });
            req.module = data;
            next();
        });
    }
}

module.exports = Module;