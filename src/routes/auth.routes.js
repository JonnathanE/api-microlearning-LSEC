const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');
const { checkRolesExisted, checkDuplicateUsernameOrEmail } = require('../middlewares/verifySignup');

const auth = new AuthController();

router.post('/signup', [checkDuplicateUsernameOrEmail, checkRolesExisted], auth.signup);

module.exports = router;