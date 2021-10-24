const Lessons = require('../models/Lesson');
const Microlearning = require('../models/Microlearning');
const Modules = require('../models/Module');
const Card = require('../models/Card');
const Learn = require('../models/Learn');

/**
 * Controller that provides the functions used to manage the home of the frontend part
 * @module HomeController
 */

/**
 * Returns the modules that have lessons
 */
exports.modulesAssigned = async (req, res) => {
    try {
        // all modules are obtained from the database
        const modules = await Modules.find().sort({ number: 1 });
        // an array is created to store the modules that have a lesson
        let reults = [];
        // go through each module to find if it has lessons in it
        for (const m of modules) {
            // the lessons that have the associated module are searched for
            const lessons = await Lessons.find({ module: m._id }).select(['-icon']);
            // check if the lesson has a module
            if (lessons.length !== 0) {
                reults.push(m);
            }
        }
        // returns the result in a JSON
        return res.status(200).json(reults);
    } catch (error) {
        return res.status(400).json({ error: 'No se cargaron los datos. Recargar la página' });
    }
}

/**
 * Get all the lessons associated with a single module
 */
exports.lessonsAssigned = async (req, res) => {
    // getting a module by the id in the database
    const module = await Modules.findById(req.params.moduleId);
    if (!module) return res.status(400).json({ error: 'El modulo no se encontró o no está registrado' });
    // obtaining all the lessons that are associated with the module
    const lessons = await Lessons.find({ module: module._id }).select(['-icon']);
    // returns the response in JSON
    return res.status(200).json(lessons);
}

/**
 * Get all the learning capsules associated with a single lesson
 */
exports.microlearningAssigned = async (req, res) => {
    // get all the learning capsules through the lesson id
    const microlearnings = await Microlearning.find({ lesson: req.lesson._id }).select(['-image', '-gif']);
    if (microlearnings.length === 0) return res.status(400).json({ error: 'No se ha registrado contenido para esta lección' });
    // returns the response in JSON
    return res.status(200).json(microlearnings);
}

/**
 * Get all the knowledge cards associated with a single lesson
 */
exports.cardAssigned = async (req, res) => {
    // get all the knowledge cards through the lesson id, except the gif
    const cards = await Card.find({ lesson: req.lesson._id }).select(['-gif']);
    if (cards.length === 0) return res.status(400).json({ error: 'No se ha registrado contenido para esta lección' });
    // returns the response in JSON
    return res.status(200).json(cards);
}

/**
 * Method to add the new lessons that the user has completed
 */
exports.addCompleteLesson = async (req, res) => {
    // I get the user object from the request
    const { user } = req.body;
    // the Learn object corresponding to the database user is obtained, except for the microlearning attribute
    const learn = await Learn.find({ user }).select(['-microlearning']);
    // the new lesson is added in Learn in the database
    await Learn.updateOne(
        { _id: learn[0]._id },
        { $addToSet: { lesson: [req.lesson._id] } },
        function (err, managerparent) {
            if (err) return res.status(400).json({ error: 'no agregado la lección culminada' });
            res.status(200).json({ meddage: managerparent })
        });
}

/**
 * Method to get all user learning completed
 */
exports.getCompleteLearn = async (req, res) => {
    // the user id is obtained from the request parameters
    const userId = req.params.userId;
    // the Learn object is obtained from the database associated with the user's id
    const learn = await Learn.findOne({ user: userId });
    // returns the response in JSON
    return res.status(200).json(learn);
}

/**
 * Method to obtain a lesson by id.
 * The method stores the object in the request.
 * @param {Object} req Object where the lesson is stored
 * @param {Object} res Http response parameter
 * @param {Object} next next
 * @param {string} id Lesson ID obtained from the URL parameter
 */
exports.lessonById = async (req, res, next, id) => {
    // search the lesson by id
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