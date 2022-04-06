'use strict';
const formidable = require('formidable');
const fs = require('fs-extra');

const Micro = require('../models/Microlearning');
const { errorHandler } = require('../helpers/dberrorHandler');
const { uploadImage, deleteImage } = require('../libs/cloudinary');

/**
 * Class to manage the learning capsules (microlearning)
 */
class Microlearning {

    /** 
     * Method to create a new learning capsule
     * @returns {JSON}
     */
    create = async (req, res) => {
        try {
            // get request body information
            const { title, lesson } = req.body;
            // check if an image was sent and save it in cloudinary
            let image;
            if (req.files.image) {
                const resultImage = await uploadImage(req.files.image.tempFilePath);
                image = {
                    url: resultImage.secure_url,
                    public_id: resultImage.public_id
                }
                await fs.remove(req.files.image.tempFilePath)
            }
            // check if an gif was sent and save it in cloudinary
            let gif;
            if (req.files.gif) {
                const resultGif = await uploadImage(req.files.gif.tempFilePath);
                gif = {
                    url: resultGif.secure_url,
                    public_id: resultGif.public_id
                }
                await fs.remove(req.files.gif.tempFilePath)
            }
            // create a Microlearning object
            const newMicrolearning = new Micro({ title, lesson, image_url: image, gif_url: gif });
            // save to database
            await newMicrolearning.save();
            // return the created microlearning
            return res.status(200).json(newMicrolearning);
        } catch (error) {
            return res.status(400).json({ error: 'No se pudo crear el microcontenido' });
        }
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
            .populate('lesson', '-icon')
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
    remove = async (req, res) => {
        try {
            // get microlearning object from req
            let microlearning = req.microlearning;
            // check if you have the image url registered and delete it
            if (microlearning.image_url.public_id) {
                await deleteImage(microlearning.image_url.public_id);
            }
            // check if you have the gif url registered and delete it
            if (microlearning.gif_url.public_id) {
                await deleteImage(microlearning.gif_url.public_id);
            }
            // remove microlearning from database
            const microRemoved = microlearning.remove();
            // check if it was deleted
            if (!microRemoved) return res.status(400).json({ message: 'El microcontenido no se eliminó' })
            // return a response
            return res.status(200).json({ message: 'El microcontenido se eliminó con éxito' });
        } catch (error) {
            return res.status(500).json({ error: error.message});
        }
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
            .populate('lesson', '-icon')
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