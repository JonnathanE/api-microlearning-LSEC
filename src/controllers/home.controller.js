const Lessons = require('../models/Lesson');
const Microlearning = require('../models/Microlearning');
const Modules = require('../models/Module');

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