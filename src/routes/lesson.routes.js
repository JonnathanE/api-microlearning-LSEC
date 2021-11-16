const express = require('express');
const router = express.Router();
const controllersFactory = require('../controllers/controllersFactory');
const { verifyToken, isAdmin, isModerator } = require('../middlewares/authJwt');
const { lessonIcon, updateLessonIcon } = require('../controllers/images.controller');

const factory = new controllersFactory();
const lesson = factory.getController('lesson');

/**
 * Create a lesson
 * @name (POST)/api/lesson
 * @path {POST} /api/lesson
 * @header {String} authorization parameter to send the token inside the header, it must be sent in the following format: "Bearer token"
 * @body {String} name lesson name
 * @body {String} module the id of the module it belongs to
 * @body {File} icon icon type file
 * @code {200} if the request is successful
 * @code {400} if the icon file cannot be loaded or cannot be saved to the database
 * @response {String} name lesson name
 * @response {String} module the id of the module it belongs to
 * @chain {@link module:MiddlewareAuthJwt.verifyToken}
 * @chain {@link module:MiddlewareAuthJwt.isAdmin}
 */
router.post('/', [verifyToken, isAdmin],lesson.create);

/**
 * Get the whole lesson without the icon
 * @name (GET)/api/lesson
 * @path {GET} /api/lesson
 * @code {200} if the request is successful
 * @code {400} if no registered data is found
 * @response {Array} lesson returns an array of lesson objects
 */
router.get('/', lesson.getAll);

/**
 * Get lesson by id without icon
 * @name (GET)/api/lesson/:lessonId
 * @path {GET} /api/lesson/:lessonId
 * @params {String} :lessonId is the unique identifier of the lesson
 * @code {200} if the request is successful
 * @code {400} if no registered data is found
 * @response {Object} lesson returns the information of a lesson in JSON except the icon
 * @response {String} lesson.name lesson name
 * @response {String} lesson.module the id of the module it belongs to
 */
router.get('/:lessonId', lesson.getById);

/**
 * Update name and module of lesson
 * @name (PUT)/api/lesson/:lessonId
 * @path {PUT} /api/lesson/:lessonId
 * @params {String} :lessonId is the unique identifier of the lesson
 * @header {String} authorization parameter to send the token inside the header, it must be sent in the following format: "Bearer token"
 * @body {String} name lesson name
 * @body {String} module the id of the module it belongs to
 * @code {200} if the request is successful
 * @code {400} if there is an error in the sent data or it cannot be saved in the database
 * @response {String} message confirmation message
 * @chain {@link module:MiddlewareAuthJwt.verifyToken}
 * @chain {@link module:MiddlewareAuthJwt.isAdmin}
 */
router.put('/:lessonId', [verifyToken, isAdmin], lesson.update);

/**
 * Delete lesson
 * @name (DELETE)/api/lesson/:lessonId
 * @path {DELETE} /api/lesson/:lessonId
 * @params {String} :lessonId is the unique identifier of the lesson
 * @header {String} authorization parameter to send the token inside the header, it must be sent in the following format: "Bearer token"
 * @code {200} if the request is successful
 * @code {400} if the requested lesson is not found
 * @response {String} message confirmation message
 * @chain {@link module:MiddlewareAuthJwt.verifyToken}
 * @chain {@link module:MiddlewareAuthJwt.isAdmin}
 */
router.delete('/:lessonId', [verifyToken, isAdmin], lesson.remove);

/**
 * Get the lesson icon
 * @name (GET)/api/lesson/icon/:lessonId
 * @path {GET} /api/lesson/icon/:lessonId
 * @params {String} :lessonId is the unique identifier of the lesson
 * @code {200} if the request is successful
 * @code {400} if no registered data is found
 * @response {String} icon render the icon
 */
router.get('/icon/:lessonId', lessonIcon);

/**
 * Update lesson icon
 * @name (PUT)/api/lesson/icon/update/:lessonId
 * @path {PUT} /api/lesson/icon/update/:lessonId
 * @params {String} :lessonId is the unique identifier of the lesson
 * @header {String} authorization parameter to send the token inside the header, it must be sent in the following format: "Bearer token"
 * @body {File} icon icon type file
 * @code {200} if the request is successful
 * @code {400} if there is an error in the sent data or it cannot be saved in the database
 * @response {String} message confirmation message
 * @chain {@link module:MiddlewareAuthJwt.verifyToken}
 * @chain {@link module:MiddlewareAuthJwt.isAdmin}
 */
router.put('/icon/update/:lessonId', [verifyToken, isAdmin], updateLessonIcon);

// method to obtain the parameter
router.param('lessonId', lesson.byId);

module.exports = router;