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


}

module.exports = Module;