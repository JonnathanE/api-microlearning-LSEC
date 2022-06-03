const User = require('../models/User');
const Lessons = require('../models/Lesson');
const Microlearning = require('../models/Microlearning');
const Modules = require('../models/Module');
const Card = require('../models/Card');
const Learn = require('../models/Learn');


exports.reset = async (req, res) => {
    await Learn.deleteMany({})
    await User.deleteMany({})
    await Modules.deleteMany({})
    await Lessons.deleteMany({})
    await Microlearning.deleteMany({})

    return res.status(204).end();
}