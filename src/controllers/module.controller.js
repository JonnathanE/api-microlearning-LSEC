'use strict';
const Modules = require('../models/Module');
const { errorHandler } = require('../helpers/dberrorHandler');

/**
 * Class to manage the learning modules
 */
class Module {

    /**
     * Method to create a new learning module
     */
    create = async (req, res) => {
        // create a module object
        const modules = new Modules(req.body);
        // save the module object in the database
        await modules.save((err, data) => {
            if (err) return res.status(400).json({ error: errorHandler(err) });
            res.status(200).json(data);
        });
    }

    /**
     * Method to get all learning modules
     */
    getAll = async (req, res) => {
        // get all the modules from the database in ascending order according to the module number
        await Modules.find().sort({number: 1}).exec((err, data) => {
            if (err) return res.status(400).json({ error: errorHandler(err) });
            res.status(200).json(data);
        });
    }

    /**
     * Method to return the learning module by id.
     * The search method is {@link byId} where it is stored in the request, therefore the method only returns the object that is already in the request.
     */
    getById = async (req, res) => {
        return res.status(200).json(req.module);
    }

    /**
     * Method to remove a learning module
     * @param {{module: Object}} req request with the learning module object provided by the {@link byId} function
     */
    remove = async (req, res) => {
        // get the learnig module provided by the request
        let module = req.module;
        // remove the learning module
        module.remove((err, data) => {
            if (err) return res.status(400).json({ error: errorHandler(err) });
            res.status(200).json({ message: 'Modulo eliminado correctamente' });
        });
    }

    /**
     * Method to update a learning module
     * @param {{body: Object}} req Request where the form data is located
     */
    update = async (req, res) => {
        // get the data from the request form
        const { number, name } = req.body;
        // get the module object from the request
        let module = req.module;
        // replace the information in the module object
        if (number) module.number = number;
        if (name) module.name = name;
        // update the new information in the database
        module.save((err, data) => {
            if (err) return res.status(400).json({ error: errorHandler(err) });
            res.status(200).json({ message: 'Modulo actualizado correctamente' });
        });
    }

    /**
     * Method to obtain a learning module by id.
     * The method stores the object in the request.
     * @param {Object} req Request where the learning module will be stored
     * @param {Object} res Http response parameter
     * @param {Object} next next
     * @param {string} id Module ID obtained from the URL parameter
     */
    byId = async (req, res, next, id) => {
        // search for learning module by id
        await Modules.findById(id).exec((err, data) => {
            if (err || !data) return res.status(400).json({ error: 'El modulo no se encontró o no existe' });
            // save the learning module found in the request
            req.module = data;
            // continue with the next process
            next();
        });
    }
}

module.exports = Module;