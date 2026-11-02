import express from 'express';
import * as lesson from '../controllers/lesson.controller.js';
import { authenticate, requireAdmin } from '../middlewares/auth.js';
import { requireImages, upload } from '../middlewares/upload.js';
import validate from '../middlewares/validate.js';
import { idParams } from '../schemas/common.schema.js';
import * as schemas from '../schemas/lesson.schema.js';

const MAX_ICON_SIZE = 1000000;

const router = express.Router();
const params = idParams('lessonId');
const adminOnly = [authenticate, requireAdmin];
const icon = [...upload, requireImages(['icon'], MAX_ICON_SIZE)];

router.get('/', validate({ query: schemas.listQuery }), lesson.getAll);
router.get('/:lessonId', validate({ params }), lesson.getById);
router.post('/', adminOnly, icon, validate({ body: schemas.create }), lesson.create);
router.put('/:lessonId', adminOnly, validate({ params, body: schemas.update }), lesson.update);
router.delete('/:lessonId', adminOnly, validate({ params }), lesson.remove);
router.get('/icon/:lessonId', validate({ params }), lesson.getIcon);
router.put('/icon/update/:lessonId', adminOnly, validate({ params }), icon, lesson.updateIcon);

export default router;
