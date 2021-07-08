const express = require('express');
const router = express.Router();
const controllersFactory = require('../controllers/controllersFactory');
const { verifyToken, isAdmin, isModerator } = require('../middlewares/authJwt');
const { lessonIcon, updateLessonIcon } = require('../controllers/images.controller');

const factory = new controllersFactory();
const lesson = factory.getController('lesson');

// create lesson
router.post('/', [verifyToken, isAdmin],lesson.create);
// get the whole lesson without the icon
router.get('/', lesson.getAll);
// get lesson by id without icon
router.get('/:lessonId', lesson.getById);
// get icon
router.get('/icon/:lessonId', lessonIcon)
// update name and module of lesson
router.put('/:lessonId', [verifyToken, isAdmin],lesson.update);
// update lesson icon
router.put('/icon/update/:lessonId', [verifyToken, isAdmin],updateLessonIcon);
// delete module
router.delete('/:lessonId', [verifyToken, isAdmin],lesson.remove);

// method to obtain the parameter
router.param('lessonId', lesson.byId);

module.exports = router;