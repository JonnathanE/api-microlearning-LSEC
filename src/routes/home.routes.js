const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin, isModerator } = require('../middlewares/authJwt');
const { modulesAssigned, lessonsAssigned } = require('../controllers/home.controller');

router.get('/modules', modulesAssigned);
router.get('/lessons/:moduleId', lessonsAssigned);

// method to obtain the parameter
//router.param('lessonId', lesson.byId)

module.exports = router;