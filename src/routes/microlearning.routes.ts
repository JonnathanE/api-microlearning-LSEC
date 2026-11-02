import express from 'express';
import * as micro from '../controllers/microlearning.controller.js';
import { authenticate, requireAdmin } from '../middlewares/auth.js';
import { requireImages, upload } from '../middlewares/upload.js';
import validate from '../middlewares/validate.js';
import { idParams } from '../schemas/common.schema.js';
import * as schemas from '../schemas/microlearning.schema.js';

const router = express.Router();
const params = idParams('microId');
const adminOnly = [authenticate, requireAdmin];

router.get('/', validate({ query: schemas.listQuery }), micro.getAll);
router.get('/:microId', validate({ params }), micro.getById);
router.post('/', adminOnly, upload, requireImages(['image', 'gif']), validate({ body: schemas.create }), micro.create);
router.put('/:microId', adminOnly, validate({ params, body: schemas.update }), micro.update);
router.delete('/:microId', adminOnly, validate({ params }), micro.remove);
router.put('/image/:microId', adminOnly, validate({ params }), upload, requireImages(['image']), micro.updateImage);
router.put('/gif/:microId', adminOnly, validate({ params }), upload, requireImages(['gif']), micro.updateGif);

export default router;
