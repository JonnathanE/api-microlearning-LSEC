const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin, isModerator } = require('../middlewares/authJwt');
const { modulesAssigned, lessonsAssigned, lessonById, microlearningAssigned, cardAssigned, addCompleteLesson, getCompleteLearn } = require('../controllers/home.controller');

/**
 * Get the modules created if they have associated lessons
 * @name /api/home/modules
 * @path {GET} /api/home/modules
 * @code {200} if the request is successful
 * @code {400} if the data was not loaded
 * @response {Array} modules returns an array of objects from the modules created
 */
router.get('/modules', modulesAssigned);

/**
 * Get the lessons from a module
 * @name /api/home/lessons/:moduleId
 * @path {GET} /api/home/lessons/:moduleId
 * @params {String} :moduleId is the unique identifier of the module
 * @code {200} if the request is successful
 * @code {400} if the data was not loaded
 * @response {Array} lessons returns an array of objects from the lessons created
 */
router.get('/lessons/:moduleId', lessonsAssigned);

/**
 * Get the micro-content of a lesson
 * @name /api/home/learn/:lessonId
 * @path {GET} /api/home/learn/:lessonId
 * @params {String} :lessonId is the unique identifier of the lesson
 * @code {200} if the request is successful
 * @code {400} if the data was not loaded
 * @response {Array} lessons returns an array of all the learning capsules associated with a single lesson
 */
router.get('/learn/:lessonId', microlearningAssigned);

/**
 * Get the cards of a lesson
 * @name /api/home/card/:lessonId
 * @path {GET} /api/home/card/:lessonId
 * @params {String} :lessonId is the unique identifier of the lesson
 * @code {200} if the request is successful
 * @code {400} if the data was not loaded
 * @response {Array} lessons returns an array of all the knowledge cards associated with a single lesson
 */
router.get('/card/:lessonId', cardAssigned);

/**
 * Add lessons completed by the student
 * @name /api/home/complete/lesson/:lessonId
 * @path {PUT} /api/home/complete/lesson/:lessonId
 * @params {String} :lessonId is the unique identifier of the lesson
 * @code {200} if the request is successful
 * @code {400} if the data was not loaded
 * @response {String} message confirmation message
 */
router.put('/complete/lesson/:lessonId', verifyToken, addCompleteLesson);

/**
 * Get the learnings completed by the student
 * @name /api/home/complete/learn/:userId
 * @path {PUT} /api/home/complete/learn/:userId
 * @params {String} :userId is the unique identifier of the user
 * @code {200} if the request is successful
 * @code {400} if the data was not loaded
 * @response {Array} learn returns all lessons completed by the user
 */
router.get('/complete/learn/', verifyToken, getCompleteLearn);

// method to obtain the parameter
router.param('lessonId', lessonById);

module.exports = router;