const express = require('express');
const auth = require('../controllers/auth.controller');
const { authLimiter } = require('../middlewares/rate-limit');
const validate = require('../middlewares/validate');
const schemas = require('../schemas/auth.schema');

const router = express.Router();

router.use(authLimiter);
router.post('/signup', validate({ body: schemas.signup }), auth.signup);
router.post('/signin', validate({ body: schemas.signin }), auth.signin);
router.post('/signinadmin', validate({ body: schemas.signin }), auth.signinAdmin);

module.exports = router;
