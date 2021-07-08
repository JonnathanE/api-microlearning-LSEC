const User = require('../controllers/user.controller');
const Module = require('../controllers/module.controller');
const Lesson = require('../controllers/lesson.controller');
class controllersFactory {
    getController = (option) => {
        if (option === 'user') return new User();
        if (option === 'module') return new Module;
        if (option === 'lesson') return new Lesson;
    }
}

module.exports = controllersFactory;