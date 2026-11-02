import express from 'express';
import * as auth from '../controllers/auth.controller.js';
import { authLimiter } from '../middlewares/rate-limit.js';
import validate from '../middlewares/validate.js';
import * as schemas from '../schemas/auth.schema.js';

const router = express.Router();

router.use(authLimiter);
router.post('/signup', validate({ body: schemas.signup }), auth.signup);
router.post('/signin', validate({ body: schemas.signin }), auth.signin);
router.post('/signinadmin', validate({ body: schemas.signin }), auth.signinAdmin);

export default router;
