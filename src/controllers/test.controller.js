const Card = require('../models/Card');
const Learn = require('../models/Learn');
const Lesson = require('../models/Lesson');
const Microlearning = require('../models/Microlearning');
const Module = require('../models/Module');
const User = require('../models/User');

exports.reset = async (req, res) => {
    await Promise.all([Learn, User, Module, Lesson, Microlearning, Card].map((model) => model.deleteMany({})));
    res.status(204).end();
};
