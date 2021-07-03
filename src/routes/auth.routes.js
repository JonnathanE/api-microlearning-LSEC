const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');

const auth = new AuthController();

router.post('/signup', auth.signup);

module.exports=router;