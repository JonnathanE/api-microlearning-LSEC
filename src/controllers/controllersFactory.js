//@ts-check
const User = require('../controllers/user.controller');
const Module = require('../controllers/module.controller');
const Lesson = require('../controllers/lesson.controller');
const Microlearning = require('../controllers/microlearning.controller');
const Card = require('./card.controller');

/**
 * Class to manage the Factory Design Pattern
 */
class controllersFactory {

    /**
     * Method to get a controller: user, module, lesson, microlearning, card
     * @param {string} option Controller name to return
     * @returns {Object}
     */
    getController = (option) => {
        if (option === 'user') return new User();
        if (option === 'module') return new Module;
        if (option === 'lesson') return new Lesson;
        if (option === 'microlearning') return new Microlearning;
        if (option === 'card') return new Card;
        return null;
    }
}

module.exports = controllersFactory;