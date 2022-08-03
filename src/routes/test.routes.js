const express = require('express');
const router = express.Router();
const { reset } = require('../controllers/test.controller');

const User = require('../models/User');
const Lessons = require('../models/Lesson');
const Microlearning = require('../models/Microlearning');
const Modules = require('../models/Module');
const Card = require('../models/Card');
const Learn = require('../models/Learn');

router.post('/reset', reset);

module.exports = router;