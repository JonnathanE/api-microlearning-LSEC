const express = require('express');
const router = express.Router();
const controllersFactory = require('../controllers/controllersFactory');
const { verifyToken, isAdmin, isModerator } = require('../middlewares/authJwt');

const factory = new controllersFactory();
const ml = factory.getController('module');

/**
 * Create a module
 * @name (POST)/api/module
 * @path {POST} /api/module
 * @header {String} authorization parameter to send the token inside the header, it must be sent in the following format: "Bearer token"
 * @body {Number} number module number
 * @body {String} name module name
 * @code {200} if the request is successful
 * @code {400} if there is an error in the database
 * @response {Object} module returns a module object in JSON
 * @response {Number} module.number module number
 * @response {String} module.name module name
 * @chain {@link module:MiddlewareAuthJwt.verifyToken}
 * @chain {@link module:MiddlewareAuthJwt.isAdmin}
 */
router.post('/', [verifyToken, isAdmin], ml.create);

/**
 * Get all modules
 * @name (GET)/api/module
 * @path {GET} /api/module
 * @code {200} if the request is successful
 * @code {400} if there is an error in the database
 * @response {Object} module returns an object array of all modules in JSON
 */
router.get('/', ml.getAll);

/**
 * Get module by id
 * @name (GET)/api/module/:moduleId
 * @path {GET} /api/module/:moduleId
 * @params {String} :moduleId is the unique identifier of the module
 * @code {200} if the request is successful
 * @code {400} if there is an error in the database
 * @response {Object} module returns a module object in JSON
 * @response {Number} module.number module number
 * @response {String} module.name module name
 */
router.get('/:moduleId', ml.getById);

/**
 * Update a module
 * @name (PUT)/api/module/:moduleId
 * @path {PUT} /api/module/:moduleId
 * @params {String} :moduleId is the unique identifier of the module
 * @header {String} authorization parameter to send the token inside the header, it must be sent in the following format: "Bearer token"
 * @body {Number} number module number
 * @body {String} name module name
 * @code {200} if the request is successful
 * @code {400} if there is an error in the database
 * @response {String} message confirmation message
 * @chain {@link module:MiddlewareAuthJwt.verifyToken}
 * @chain {@link module:MiddlewareAuthJwt.isAdmin}
 */
router.put('/:moduleId', [verifyToken, isAdmin], ml.update);

/**
 * Delete a module
 * @name (DELETE)/api/module/:moduleId
 * @path {DELETE} /api/module/:moduleId
 * @params {String} :moduleId is the unique identifier of the module
 * @header {String} authorization parameter to send the token inside the header, it must be sent in the following format: "Bearer token"
 * @code {200} if the request is successful
 * @code {400} if there is an error in the database
 * @response {String} message confirmation message
 * @chain {@link module:MiddlewareAuthJwt.verifyToken}
 * @chain {@link module:MiddlewareAuthJwt.isAdmin}
 */
router.delete('/:moduleId', [verifyToken, isAdmin], ml.remove);

// method to obtain the parameter
router.param('moduleId', ml.byId);

module.exports = router;