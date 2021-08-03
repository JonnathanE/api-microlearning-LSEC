const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin, isModerator } = require('../middlewares/authJwt');
const { modulesAssigned } = require('../controllers/home.controller');

router.get('/modules', modulesAssigned);

module.exports = router;