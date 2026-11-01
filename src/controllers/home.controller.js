const homeService = require('../services/home.service');

exports.getModules = async (req, res) => {
    res.status(200).json(await homeService.listModules());
};

exports.getLessons = async (req, res) => {
    res.status(200).json(await homeService.listLessons(req.params.moduleId));
};

exports.getMicrolearning = async (req, res) => {
    res.status(200).json(await homeService.listMicrolearning(req.params.lessonId, req.validatedQuery.page));
};

exports.getCards = async (req, res) => {
    res.status(200).json(await homeService.listCards(req.params.lessonId, req.validatedQuery.page));
};

exports.completeLesson = async (req, res) => {
    await homeService.completeLesson(req.user._id, req.params.lessonId);
    res.status(200).json({ message: 'Lección completada' });
};

exports.getProgress = async (req, res) => {
    res.status(200).json(await homeService.getProgress(req.user._id));
};
