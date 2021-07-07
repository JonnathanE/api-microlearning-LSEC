const express = require('express');
const router = express.Router();
const controllersFactory = require('../controllers/controllersFactory');
const { verifyToken, isAdmin, isModerator } = require('../middlewares/authJwt');

const factory = new controllersFactory();
const ml = factory.getController('module');

// create module
router.post('/', [verifyToken, isAdmin], ml.create);

module.exports = router;