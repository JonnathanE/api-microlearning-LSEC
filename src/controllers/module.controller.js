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
        await Modules.find().exec((err, data) => {
            if (err) return res.status(400).json({ error: errorHandler(err) });
            res.status(200).json(data);
        });
    }

    remove = async (req, res) => {
        let module = req.module;
        module.remove((err, data) => {
            if (err) return res.status(400).json({ error: errorHandler(err) });
            res.status(200).json({ message: 'Modulo eliminado correctamente' });
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