const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');
const { checkRolesExisted, checkDuplicateUsernameOrEmail } = require('../middlewares/verifySignup');

// instantiate an authentication object
const auth = new AuthController();

/**
 * Create a new user
 * @name auth/signup
 * @path {POST} /api/auth/signup
 * @body {String} name Username
 * @body {String} email user email
 * @body {String} password user password
 * @body {Array} [roles='student'] user roles
 * @code {200} if the request is successful
 * @code {400} if the request fails because a parameter provided by the user is not correct and cannot be saved in the database
 * @response {JSON} user inside a JSON it returns the attributes of the user
 * @response {Number} user._id
 * @response {String} user.name
 * @response {String} user.email
 * @response {Array} user.roles
 * @chain {@link module:MiddlewareVerifySignup.checkDuplicateUsernameOrEmail}
 * @chain {@link module:MiddlewareVerifySignup.checkRolesExisted}
 */
router.post('/signup', [checkDuplicateUsernameOrEmail, checkRolesExisted], auth.signup);

/**
 * Iniciar sesión
 * @name auth/signin
 * @path {POST} /api/auth/signin
 * @body {String} email user email
 * @body {String} password user password
 * @code {200} if the request is successful
 * @code {400} if the user with that email does not exist
 * @code {401} if the user's password does not match
 * @response {String} token inside a JSON returns the generated token
 * @response {Object} user inside a JSON it returns the attributes of the user
 * @response {Number} user._id
 * @response {String} user.name
 * @response {String} user.email
 * @response {Array} user.roles
 */
router.post('/signin', auth.sigin);

/**
 * Iniciar sesión admin
 * @name auth/signin
 * @path {POST} /api/auth/signin
 * @body {String} email user email
 * @body {String} password user password
 * @code {200} if the request is successful
 * @code {400} if the user with that email does not exist
 * @code {401} if the user's password does not match
 * @response {String} token inside a JSON returns the generated token
 * @response {Object} user inside a JSON it returns the attributes of the user
 * @response {Number} user._id
 * @response {String} user.name
 * @response {String} user.email
 * @response {Array} user.roles
 */
router.post('/signinadmin', auth.siginAdmin);

/**
 * log out user
 * @name auth/signout
 * @path {POST} /api/auth/signout
 * @code {200} if the request is successful and the browser cookie is deleted
 */
router.post('/signout', auth.signout);

module.exports = router;