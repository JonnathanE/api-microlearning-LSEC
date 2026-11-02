import express from 'express';
import * as home from '../controllers/home.controller.js';
import { authenticate } from '../middlewares/auth.js';
import validate from '../middlewares/validate.js';
import { idParams, paginationQuery } from '../schemas/common.schema.js';

const router = express.Router();
const lessonContent = validate({ params: idParams('lessonId'), query: paginationQuery });

router.get('/modules', home.getModules);
router.get('/lessons/:moduleId', validate({ params: idParams('moduleId') }), home.getLessons);
router.get('/learn/:lessonId', lessonContent, home.getMicrolearning);
router.get('/card/:lessonId', lessonContent, home.getCards);
router.put('/complete/lesson/:lessonId', authenticate, validate({ params: idParams('lessonId') }), home.completeLesson);
router.get('/complete/learn', authenticate, home.getProgress);

export default router;
