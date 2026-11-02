import express from 'express';
import * as card from '../controllers/card.controller.js';
import { authenticate, requireAdmin } from '../middlewares/auth.js';
import { requireImages, upload } from '../middlewares/upload.js';
import validate from '../middlewares/validate.js';
import * as schemas from '../schemas/card.schema.js';
import { idParams } from '../schemas/common.schema.js';

const router = express.Router();
const params = idParams('cardId');
const adminOnly = [authenticate, requireAdmin];
const gif = [...upload, requireImages(['gif'])];

router.get('/', validate({ query: schemas.listQuery }), card.getAll);
router.get('/:cardId', validate({ params }), card.getById);
router.post('/', adminOnly, gif, validate({ body: schemas.create }), card.create);
router.put('/:cardId', adminOnly, validate({ params, body: schemas.update }), card.update);
router.delete('/:cardId', adminOnly, validate({ params }), card.remove);
router.put('/gif/:cardId', adminOnly, validate({ params }), gif, card.updateGif);

export default router;
