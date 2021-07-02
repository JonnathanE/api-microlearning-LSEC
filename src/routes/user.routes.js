const express = require('express');
const router = express.Router();

const controllersFactory = require('../controllers/controllersFactory');
const User = require('../controllers/user.controller');
const userController = new User();

const factory = new controllersFactory();
const user = factory.factory('user')

router.get('/', userController.signup);

module.exports=router;