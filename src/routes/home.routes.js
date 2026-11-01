const express = require('express');
const home = require('../controllers/home.controller');
const { authenticate } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { idParams, paginationQuery } = require('../schemas/common.schema');

const router = express.Router();
const lessonContent = validate({ params: idParams('lessonId'), query: paginationQuery });

router.get('/modules', home.getModules);
router.get('/lessons/:moduleId', validate({ params: idParams('moduleId') }), home.getLessons);
router.get('/learn/:lessonId', lessonContent, home.getMicrolearning);
router.get('/card/:lessonId', lessonContent, home.getCards);
router.put('/complete/lesson/:lessonId', authenticate, validate({ params: idParams('lessonId') }), home.completeLesson);
router.get('/complete/learn', authenticate, home.getProgress);

module.exports = router;
