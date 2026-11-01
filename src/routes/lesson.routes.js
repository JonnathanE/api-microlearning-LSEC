const express = require('express');
const lesson = require('../controllers/lesson.controller');
const { authenticate, requireAdmin } = require('../middlewares/auth');
const { upload, requireImages } = require('../middlewares/upload');
const validate = require('../middlewares/validate');
const { idParams } = require('../schemas/common.schema');
const schemas = require('../schemas/lesson.schema');

const MAX_ICON_SIZE = 1000000;

const router = express.Router();
const params = idParams('lessonId');
const adminOnly = [authenticate, requireAdmin];
const icon = [upload, requireImages(['icon'], MAX_ICON_SIZE)];

router.get('/', validate({ query: schemas.listQuery }), lesson.getAll);
router.get('/:lessonId', validate({ params }), lesson.getById);
router.post('/', adminOnly, icon, validate({ body: schemas.create }), lesson.create);
router.put('/:lessonId', adminOnly, validate({ params, body: schemas.update }), lesson.update);
router.delete('/:lessonId', adminOnly, validate({ params }), lesson.remove);
router.get('/icon/:lessonId', validate({ params }), lesson.getIcon);
router.put('/icon/update/:lessonId', adminOnly, validate({ params }), icon, lesson.updateIcon);

module.exports = router;
