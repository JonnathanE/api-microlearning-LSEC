const express = require('express');
const router = express.Router();

const controllersFactory = require('../controllers/controllersFactory');

const factory = new controllersFactory();
const user = factory.getController('user');

/**
 * @todo complete user management methods
 */
router.get('/', user.signup);

module.exports=router;