const express = require('express');
const router = express.Router();
const controllersFactory = require('../controllers/controllersFactory');
const { verifyToken, isAdmin, isModerator } = require('../middlewares/authJwt');
const { microlearningImage, updateMicrolearningImage, microlearningGif, updateMicrolearningGif } = require('../controllers/images.controller');

const factory = new controllersFactory();
const micro = factory.getController('microlearning');

/**
 * Create a microlearning
 * @name (POST)/api/micro
 * @path {POST} /api/micro
 * @header {String} authorization parameter to send the token inside the header, it must be sent in the following format: "Bearer token"
 * @body {String} title microlearning title
 * @body {String} lesson the id of the lesson it belongs to
 * @body {File} image image type file
 * @body {File} gif gif type file
 * @code {200} if the request is successful
 * @code {400} if the icon file cannot be loaded or cannot be saved to the database
 * @response {String} title microlearning title
 * @response {String} lesson the id of the lesson it belongs to
 * @chain {@link module:MiddlewareAuthJwt.verifyToken}
 * @chain {@link module:MiddlewareAuthJwt.isAdmin}
 */
router.post('/', [verifyToken, isAdmin], micro.create);

/**
 * Get the whole microlearning without the image and gif
 * @name (GET)/api/micro
 * @path {GET} /api/micro
 * @code {200} if the request is successful
 * @code {400} if the icon file cannot be loaded or cannot be saved to the database
 * @response {Array} microlearnig array of microlearning objects created
 */
router.get('/', micro.getAll);

/**
 * Get microlearning by id without image and gif
 * @name (GET)/api/micro/:microId
 * @path {GET} /api/micro/:microId
 * @params {String} :microId is the unique identifier of the microlearning
 * @code {200} if the request is successful
 * @code {400} if no recorded data was found
 * @response {Object} microlearnig microlearning object in JSON
 */
router.get('/:microId', micro.getById);

/**
 * Delete microlearning
 * @name (DELETE)/api/micro/:microId
 * @path {DELETE} /api/micro/:microId
 * @params {String} :microId is the unique identifier of the microlearning
 * @code {200} if the request is successful
 * @code {400} if no recorded data was found
 * @response {String} message confirmation message
 * @chain {@link module:MiddlewareAuthJwt.verifyToken}
 * @chain {@link module:MiddlewareAuthJwt.isAdmin}
 */
router.delete('/:microId', [verifyToken, isAdmin],micro.remove);

/**
 * Update title and lesson of mucrolearnig
 * @name (PUT)/api/micro/:microId
 * @path {PUT} /api/micro/:microId
 * @params {String} :microId is the unique identifier of the microlearning
 * @header {String} authorization parameter to send the token inside the header, it must be sent in the following format: "Bearer token"
 * @body {String} title microlearning title
 * @body {String} lesson the id of the lesson it belongs to
 * @code {200} if the request is successful
 * @code {400} if there is an error in the database
 * @response {String} message confirmation message
 * @chain {@link module:MiddlewareAuthJwt.verifyToken}
 * @chain {@link module:MiddlewareAuthJwt.isAdmin}
 */
router.put('/:microId', [verifyToken, isAdmin], micro.update);

/**
 * get the image of microlearning
 * @name (GET)/api/micro/image/:microId
 * @path {GET} /api/micro/image/:microId
 * @params {String} :microId is the unique identifier of the microlearning
 * @code {200} if the request is successful
 * @code {400} if no recorded data was found
 * @response {String} image render the image
 */
router.get('/image/:microId', microlearningImage);

/**
 * Update the image of microlearning
 * @name (PUT)/api/micro/image/:microId
 * @path {PUT} /api/micro/image/:microId
 * @params {String} :microId is the unique identifier of the microlearning
 * @header {String} authorization parameter to send the token inside the header, it must be sent in the following format: "Bearer token"
 * @body {File} image image type file
 * @code {200} if the request is successful
 * @code {400} if the image file cannot be loaded or cannot be saved to the database
 * @response {String} confirmation message
 * @chain {@link module:MiddlewareAuthJwt.verifyToken}
 * @chain {@link module:MiddlewareAuthJwt.isAdmin}
 */
router.put('/image/:microId', [verifyToken, isAdmin], updateMicrolearningImage);

/**
 * Get the gif of microlearning
 * @name (GET)/api/micro/gif/:microId
 * @path {GET} /api/micro/gif/:microId
 * @params {String} :microId is the unique identifier of the microlearning
 * @code {200} if the request is successful
 * @code {400} if no recorded data was found
 * @response {String} image render the gif
 */
router.get('/gif/:microId', microlearningGif);

/**
 * Update the gif of microlearning
 * @name (PUT)/api/micro/gif/:microId
 * @path {PUT} /api/micro/gif/:microId
 * @params {String} :microId is the unique identifier of the microlearning
 * @header {String} authorization parameter to send the token inside the header, it must be sent in the following format: "Bearer token"
 * @body {File} gif gif type file
 * @code {200} if the request is successful
 * @code {400} if the image file cannot be loaded or cannot be saved to the database
 * @response {String} confirmation message
 * @chain {@link module:MiddlewareAuthJwt.verifyToken}
 * @chain {@link module:MiddlewareAuthJwt.isAdmin}
 */
router.put('/gif/:microId', [verifyToken, isAdmin], updateMicrolearningGif);

// method to obtain the parameter
router.param('microId', micro.byId);

module.exports = router;