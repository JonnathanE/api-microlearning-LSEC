import express from 'express';
import * as user from '../controllers/user.controller.js';
import { authenticate, requireAdmin, requireSelfOrAdmin } from '../middlewares/auth.js';
import validate from '../middlewares/validate.js';
import { idParams } from '../schemas/common.schema.js';
import * as schemas from '../schemas/user.schema.js';

const router = express.Router();
const params = idParams('userId');

router.use(authenticate);
router.get('/', requireAdmin, validate({ query: schemas.listQuery }), user.getAll);
router.get('/find', user.getCurrent);
router.get('/find/:userId', requireAdmin, validate({ params }), user.getById);
router.put('/:userId', validate({ params, body: schemas.update }), requireSelfOrAdmin, user.update);
router.put('/:userId/roles', requireAdmin, validate({ params, body: schemas.updateRoles }), user.updateRoles);
router.delete('/:userId', requireAdmin, validate({ params }), user.remove);

export default router;
