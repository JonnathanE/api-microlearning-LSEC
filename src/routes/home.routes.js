const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin, isModerator } = require('../middlewares/authJwt');
const { modulesAssigned, lessonsAssigned, lessonById, microlearningAssigned, cardAssigned } = require('../controllers/home.controller');

// get the modules created if they have associated lessons 
router.get('/modules', modulesAssigned);
// get the lessons from a module
router.get('/lessons/:moduleId', lessonsAssigned);
// get the micro-content of a lesson
router.get('/learn/:lessonId', microlearningAssigned)
// get the cards of a lesson
router.get('/card/:lessonId', cardAssigned)

// method to obtain the parameter
router.param('lessonId', lessonById);

module.exports = router;