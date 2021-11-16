'use strict';
const formidable = require('formidable');
const fs = require('fs');

const Micro = require('../models/Microlearning');
const { errorHandler } = require('../helpers/dberrorHandler')

/**
 * Class to manage the learning capsules (microlearning)
 */
class Microlearning {

    /** 
     * Method to create a new learning capsule
     * @returns {JSON}
     */
    create = async (req, res) => {
        // created a new form object
        let form = new formidable.IncomingForm();
        form.keepExtensions = true;
        // I extract the data from the request form
        form.parse(req, async (err, fields, files) => {

            if (err) return res.status(400).json({ error: 'No se pudo cargar la imagen' });
            // a learning capsule is created with the form data
            let micro = new Micro(fields);
            // it is verified if the sent file is of type image
            if (files.image) {
                 // file size is checked
                if (files.image.size > 9000000) {
                    return res.status(400).json({ error: 'La imagen debe tener un tamaño inferior a 9 MB.' });
                }
                // the image is stored in the object micro as a buffer data type
                micro.image.data = fs.readFileSync(files.image.path);
                micro.image.contentType = files.image.type;
            }
            // it is verified if the sent file is of type gif
            if (files.gif) {
                 // file size is checked
                if (files.gif.size > 9000000) {
                    return res.status(400).json({ error: 'El GIF debe tener un tamaño inferior a 9 MB.' });
                }
                // the gif is stored in the object micro as a buffer data type
                micro.gif.data = fs.readFileSync(files.gif.path);
                micro.gif.contentType = files.gif.type;
            }
            // the learning capsule is saved in the database
            await micro.save((err, result) => {
                if (err) return res.status(400).json({ error: 'No se pudo crear el microcontenido' });
                res.status(200).json(result);
            });
        });
    }

    /**
     * Method to get all learning capsules
     * @returns {JSON}
     */
    getAll = async (req, res) => {
        // the search filters are obtained from the request
        let order = req.query.order ? req.query.order : 'asc'; // variable to sort the results; ascending by default
        let sortBy = req.query.sortBy ? req.query.sortBy : 'title'; // filter
        // all the learning capsules from the database are obtained and returned in JSON format
        await Micro.find()
            .select(['-image', '-gif'])
            .populate('lesson')
            .sort([[sortBy, order]])
            .exec((err, micro) => {
                if (err) return res.status(400).json({ error: 'Microcontenidos no encontrados' });
                res.status(200).json(micro);
            });
    }

    /**
     * Method to return the learning capsule by id.
     * The method only returns the information except the gif and image.
     * The search method is {@link byId} where it is stored in the request, therefore the method only returns the object that is already in the request.
     * @returns {JSON}
     */
    getById = (req, res) => {
        req.microlearning.image = undefined;
        req.microlearning.gif = undefined;
        return res.status(200).json(req.microlearning);
    }

    /**
     * Method to remove a learning capsule
     * @param {{body: {microlearning: Object}}} req request with the knowledge cards object provided by the {@link byId} function
     * @returns {JSON}
     */
    remove = (req, res) => {
        let microlearning = req.microlearning;
        microlearning.remove((err, deleteMicro) => {
            if (err) return res.status(400).json({ error: errorHandler(err) });
            res.status(200).json({ message: 'El microcontenido se eliminó con éxito' })
        });
    }

    /**
     * Method to update a learning capsule
     * @param {{body: Object}} req Request where the form data is located
     * @returns {JSON}
     */
    update = (req, res) => {
        // get the data from the request form
        const { title, lesson } = req.body;
        // get the microlearning object from the request
        let microlearning = req.microlearning;
        // replace the information in the card object
        if (title) microlearning.title = title;
        if (lesson) microlearning.lesson = lesson;
        // update the new information in the database
        microlearning.save((err, data) => {
            if (err) return res.status(400).json({ error: errorHandler(err) });
            res.status(200).json({ message: 'El microcontenido se actualizado correctamente' });
        });
    }

    /**
     * Method to obtain a learning capsule by id.
     * The method stores the object in the request.
     * @param {Object} req Request where the knowledge cards will be stored
     * @param {Object} res Http response parameter
     * @param {Object} next next
     * @param {string} id Card ID obtained from the URL parameter
     */
    byId = async (req, res, next, id) => {
        // search for learning capsule by id
        await Micro.findById(id)
            .populate('lesson', 'name')
            .exec((err, micro) => {
                if (err || !micro) return res.status(400).json({ error: 'El microcontenido no se encontró o no existe' });
                // save the learning capsule found in the request
                req.microlearning = micro;
                // continue with the next process
                next();
            });
    }
}

module.exports = Microlearning;