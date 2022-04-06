const express = require('express');
const router = express.Router();
const controllersFactory = require('../controllers/controllersFactory');
const { verifyToken, isAdmin } = require('../middlewares/authJwt');
const { cardGif, updateCardGif } = require('../controllers/images.controller');

const factory = new controllersFactory();
const card = factory.getController('card');

/**
 * create a new knowledge card
 * @name (POST)api/card
 * @path {POST} /api/card/
 * @header {String} authorization parameter to send the token inside the header, it must be sent in the following format: "Bearer token"
 * @body {String} question card question
 * @body {String} lesson the id of the lesson it belongs to
 * @body {String} correctAnswer correct question on the card
 * @body {String} wrongAnswer wrong card question
 * @body {File} gif gif type file
 * @code {200} if the request is successful
 * @code {400} if the gif file cannot be loaded or cannot be saved to the database
 * @response {String} question
 * @response {String} lesson
 * @response {String} correctAnswer
 * @response {String} wrongAnswer
 * @response {String} [gif='undefined']
 * @chain {@link module:MiddlewareAuthJwt.verifyToken}
 * @chain {@link module:MiddlewareAuthJwt.isAdmin}
 */
router.post('/', [verifyToken, isAdmin], card.create);

/**
 * get the whole card without the gif
 * @name (GET)api/card
 * @path {GET} /api/card/
 * @code {200} if the request is successful
 * @code {400} if no card is registered
 * @response {Array} card returns an array with all the cards as an object
 */
router.get('/', card.getAll);

/**
 * get knowledge card by id without gif
 * @name (GET)api/card/:cardId
 * @path {GET} /api/card/:cardId
 * @params {String} :cardId is the unique identifier of the card
 * @code {200} if the request is successful
 * @code {400} if no card is registered
 * @response {Object} card returns the card data in a JSON
 * @response {String} card.question
 * @response {String} card.lesson
 * @response {String} card.correctAnswer
 * @response {String} card.wrongAnswer
 */
router.get('/:cardId', card.getById);

/**
 * delete knowledge card
 * @name (DELETE)api/card/:cardId
 * @path {DELETE} /api/card/:cardId
 * @params {String} :cardId is the unique identifier of the card
 * @header {String} authorization parameter to send the token inside the header, it must be sent in the following format: "Bearer token"
 * @code {200} if the request is successful
 * @code {400} if the card was not removed
 * @response {String} message confirmation message
 * @chain {@link module:MiddlewareAuthJwt.verifyToken}
 * @chain {@link module:MiddlewareAuthJwt.isAdmin}
 */
router.delete('/:cardId', [verifyToken, isAdmin], card.remove);

/**
 * update knowledge card
 * @name (PUT)api/card/:cardId
 * @path {PUT} /api/card/:cardId
 * @params {String} :cardId is the unique identifier of the card
 * @header {String} authorization parameter to send the token inside the header, it must be sent in the following format: "Bearer token"
 * @body {String} question card question
 * @body {String} lesson the id of the lesson it belongs to
 * @body {String} correctAnswer correct question on the card
 * @body {String} wrongAnswer wrong card question
 * @code {200} if the request is successful
 * @code {400} if the card was not removed
 * @response {String} message confirmation message
 * @chain {@link module:MiddlewareAuthJwt.verifyToken}
 * @chain {@link module:MiddlewareAuthJwt.isAdmin}
 */
router.put('/:cardId', [verifyToken, isAdmin], card.update)

/**
 * Render the knowledge card gif
 * @name (GET)api/card/gif/:cardId
 * @path {GET} /api/card/gif/:cardId
 * @params {String} :cardId is the unique identifier of the card
 * @response {GIF} card Render the knowledge card gif
 */
router.get('/gif/:cardId', cardGif);

/**
 * Update the knowledge card gif
 * @name (PUT)api/card/gif/:cardId
 * @path {PUT} /api/card/gif/:cardId
 * @params {String} :cardId is the unique identifier of the card
 * @code {200} if the request is successful
 * @code {400} if the gif file cannot be loaded or cannot be saved to the database
 * @response {GIF} card Render the knowledge card gif
 * @chain {@link module:MiddlewareAuthJwt.verifyToken}
 * @chain {@link module:MiddlewareAuthJwt.isAdmin}
 */
router.put('/gif/:cardId', [verifyToken, isAdmin], updateCardGif);

// method to get card id from url
router.param('cardId', card.byId);

module.exports = router;