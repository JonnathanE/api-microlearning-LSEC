const Lessons = require('../models/Lesson');
const Microlearning = require('../models/Microlearning');
const Modules = require('../models/Module');
const Card = require('../models/Card');
const Learn = require('../models/Learn');

exports.modulesAssigned = async (req, res) => {
    try {
        const modules = await Modules.find().sort({ number: 1 });
        let reults = [];
        for (const m of modules) {
            const lessons = await Lessons.find({ module: m._id }).select(['-icon']);
            if (lessons.length !== 0) {
                reults.push(m);
            }
        }
        return res.status(200).json(reults);
    } catch (error) {
        return res.status(400).json({ error: 'No se cargaron los datos. Recargar la página' });
    }
}

exports.lessonsAssigned = async (req, res) => {
    const module = await Modules.findById(req.params.moduleId);
    if (!module) return res.status(400).json({ error: 'El modulo no se encontró o no está registrado' });
    const lessons = await Lessons.find({ module: module._id }).select(['-icon']);
    return res.status(200).json(lessons);
}

exports.microlearningAssigned = async (req, res) => {
    const microlearnings = await Microlearning.find({ lesson: req.lesson._id }).select(['-image', '-gif']);
    if (microlearnings.length === 0) return res.status(400).json({ error: 'No se ha registrado contenido para esta lección' });
    return res.status(200).json(microlearnings);
}

exports.cardAssigned = async (req, res) => {
    const cards = await Card.find({ lesson: req.lesson._id }).select(['-gif']);
    if (cards.length === 0) return res.status(400).json({ error: 'No se ha registrado contenido para esta lección' });
    return res.status(200).json(cards);
}

exports.addCompleteLesson = async (req, res) => {
    const { user } = req.body;
    const learn = await Learn.find({ user }).select(['-microlearning']);
    await Learn.updateOne(
        { _id: learn[0]._id },
        { $addToSet: { lesson: [req.lesson._id] } },
        function (err, managerparent) {
            if (err) return res.status(400).json({ error: 'no agregado la lección culminada' });
            res.status(200).json({ meddage: managerparent })
        });
}

exports.getCompleteLearn = async (req, res) => {
    const userId = req.params.userId;
    const learn = await Learn.findOne({user: userId});
    return res.status(200).json(learn);
}

exports.lessonById = async (req, res, next, id) => {
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