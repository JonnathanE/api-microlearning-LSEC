const express = require('express');
const router = express.Router();
const controllersFactory = require('../controllers/controllersFactory');
const { verifyToken, isAdmin, isModerator } = require('../middlewares/authJwt');

const factory = new controllersFactory();
const lesson = factory.getController('lesson');

// create lesson
router.post('/', lesson.create);
// get the whole lesson without the icon
router.get('/', lesson.getAll);
// delete module
router.delete('/:lessonId', lesson.remove);

// method to obtain the parameter
router.param('lessonId', lesson.byId);

module.exports = router;