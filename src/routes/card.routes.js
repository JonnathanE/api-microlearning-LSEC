const express = require('express');
const card = require('../controllers/card.controller');
const { authenticate, requireAdmin } = require('../middlewares/auth');
const { upload, requireImages } = require('../middlewares/upload');
const validate = require('../middlewares/validate');
const { idParams } = require('../schemas/common.schema');
const schemas = require('../schemas/card.schema');

const router = express.Router();
const params = idParams('cardId');
const adminOnly = [authenticate, requireAdmin];
const gif = [upload, requireImages(['gif'])];

router.get('/', validate({ query: schemas.listQuery }), card.getAll);
router.get('/:cardId', validate({ params }), card.getById);
router.post('/', adminOnly, gif, validate({ body: schemas.create }), card.create);
router.put('/:cardId', adminOnly, validate({ params, body: schemas.update }), card.update);
router.delete('/:cardId', adminOnly, validate({ params }), card.remove);
router.put('/gif/:cardId', adminOnly, validate({ params }), gif, card.updateGif);

module.exports = router;
