const express = require('express');
const micro = require('../controllers/microlearning.controller');
const { authenticate, requireAdmin } = require('../middlewares/auth');
const { upload, requireImages } = require('../middlewares/upload');
const validate = require('../middlewares/validate');
const { idParams } = require('../schemas/common.schema');
const schemas = require('../schemas/microlearning.schema');

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

module.exports = router;
