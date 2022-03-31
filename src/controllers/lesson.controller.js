'use strict';
const formidable = require('formidable');
const _ = require('lodash');
const fs = require('fs');
const fse = require('fs-extra');

const Lessons = require('../models/Lesson');
const { errorHandler } = require('../helpers/dberrorHandler');

/**
 * Class to manage the lesson
 */
class Lesson {

    /**
     * Method to create a lesson
     */
    create = async (req, res) => {
        try {
            // a lesson is created with the form data
            const { name, module } = req.body;
            let lesson = new Lessons({ name, module });
            // check if an image was sent and save it in cloudinary
            if (req.files.icon) {
                // file size is checked
                if (req.files.icon.size > 1000000) {
                    return res.status(400).json({ error: "La imagen debe tener un tamaño inferior a 1 MB." });
                }
                // the icon is stored in the object lesson as a buffer data type
                lesson.icon.data = fs.readFileSync(req.files.icon.tempFilePath);
                lesson.icon.contentType = req.files.icon.mimetype;
                await fse.remove(req.files.icon.tempFilePath);
            }
            // save to database
            await lesson.save();
            // return the created lesson
            lesson.icon = undefined;
            return res.status(200).json(lesson);
        } catch (error) {
            console.log(error)
            return res.status(400).json({ error: "No se creó la lección para este módulo" })
        }
    }

    /**
     * Method to get all the lessons from the database
     */
    getAll = async (req, res) => {
        // the search filters are obtained from the request
        let order = req.query.order ? req.query.order : 'asc'; // variable to sort the results; ascending by default
        let sortBy = req.query.sortBy ? req.query.sortBy : 'name'; // filter
        // all the lessons from the database are obtained and returned in JSON format
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

    /**
    * Method to return the lesson by id.
    * The method only returns the information except the icon.
    * The search method is {@link byId} where it is stored in the request, therefore the method only returns the object that is already in the request.
    * @returns {JSON}
    */
    getById = (req, res) => {
        req.lesson.icon = undefined;
        return res.status(200).json(req.lesson);
    }

    /**
     * Method to remove a lesson
     * @param {{req: {lesson: Object}}} req request with the lesson object provided by the {@link byId} function
     */
    remove = (req, res) => {
        // get the Lesson object provided by the request
        let lesson = req.lesson;
        // remove the lesson
        lesson.remove((err, deleteLesson) => {
            if (err) return res.status(400).json({ error: errorHandler(err) });
            res.json({ message: "La lección se eliminó con éxito" });
        });
    }

    /**
     * Method to update a lesson
     * @param {{body: Object}} req Request where the form data is located
     */
    update = (req, res) => {
        // get the data from the request form
        const { name, module } = req.body;
        // get the lesson object from the request
        let lesson = req.lesson;
        // replace the information in the lesson object
        if (name) lesson.name = name;
        if (module) lesson.module = module;
        // update the new information in the database
        lesson.save((err, data) => {
            if (err) return res.status(400).json({ error: 'No se guardaron los cambios' });
            res.status(200).json({ message: 'Lección actualizado correctamente' });
        });
    }

    /**
     * Method to obtain a lesson by id.
     * The method stores the object in the request.
     * @param {Object} req Request where the lesson will be stored
     * @param {Object} res Http response parameter
     * @param {Object} next next
     * @param {string} id Lesson ID obtained from the URL parameter
     */
    byId = async (req, res, next, id) => {
        await Lessons.findById(id)
            .populate("module")
            .exec((err, lesson) => {
                if (err || !lesson) {
                    return res.status(400).json({ error: "La lección no se encontró o no existe" });
                }
                // save the lesson found in the request
                req.lesson = lesson;
                // continue with the next process
                next();
            });
    }
}

module.exports = Lesson;