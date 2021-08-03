const Lessons = require('../models/Lesson');
const Microlearning = require('../models/Microlearning');
const Modules = require('../models/Module');

exports.modulesAssigned= async (req, res) => {
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
        return res.status(400).json({error: 'No se cargaron los datos. Recargar la página'});
    }
}