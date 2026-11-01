const Card = require('../models/Card');
const Learn = require('../models/Learn');
const Lesson = require('../models/Lesson');
const Microlearning = require('../models/Microlearning');
const Module = require('../models/Module');
const lessonService = require('./lesson.service');
const moduleService = require('./module.service');
const { NotFoundError } = require('../errors/http-errors');

// the frontend shows the content of a lesson one item at a time
const ITEMS_PER_PAGE = 1;

const paginateByLesson = async (model, lessonId, page) => {
    const result = await model.paginate({ lesson: lessonId }, { limit: ITEMS_PER_PAGE, page });
    if (result.totalDocs === 0) throw new NotFoundError('No se ha registrado contenido para esta lección');
    return result;
};

const listContent = async (model, lessonId, page) => {
    const lesson = await lessonService.findById(lessonId);
    return page ? paginateByLesson(model, lesson._id, page) : model.find({ lesson: lesson._id });
};

/** Returns the modules that have lessons */
const listModules = async () => {
    const moduleIds = await Lesson.distinct('module');
    return Module.find({ _id: { $in: moduleIds } }).sort({ number: 1 });
};

const listLessons = async (moduleId) => {
    const module = await moduleService.getById(moduleId);
    return Lesson.find({ module: module._id });
};

const listMicrolearning = (lessonId, page) => listContent(Microlearning, lessonId, page);

const listCards = (lessonId, page) => listContent(Card, lessonId, page);

const completeLesson = async (userId, lessonId) => {
    const lesson = await lessonService.findById(lessonId);
    await Learn.updateOne({ user: userId }, { $addToSet: { lesson: lesson._id } }, { upsert: true });
};

const getProgress = (userId) => Learn.findOneAndUpdate({ user: userId }, {}, { upsert: true, returnDocument: 'after' });

module.exports = { listModules, listLessons, listMicrolearning, listCards, completeLesson, getProgress };
