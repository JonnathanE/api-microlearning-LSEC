import express from 'express';
import * as ml from '../controllers/module.controller.js';
import { authenticate, requireAdmin } from '../middlewares/auth.js';
import validate from '../middlewares/validate.js';
import { idParams } from '../schemas/common.schema.js';
import * as schemas from '../schemas/module.schema.js';

const router = express.Router();
const params = idParams('moduleId');
const adminOnly = [authenticate, requireAdmin];

router.get('/', ml.getAll);
router.get('/:moduleId', validate({ params }), ml.getById);
router.post('/', adminOnly, validate({ body: schemas.create }), ml.create);
router.put('/:moduleId', adminOnly, validate({ params, body: schemas.update }), ml.update);
router.delete('/:moduleId', adminOnly, validate({ params }), ml.remove);

export default router;
