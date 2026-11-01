const express = require('express');
const { reset } = require('../controllers/test.controller');

const router = express.Router();

router.post('/reset', reset);

module.exports = router;
