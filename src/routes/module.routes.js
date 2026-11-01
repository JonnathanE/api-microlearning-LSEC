const express = require('express');
const ml = require('../controllers/module.controller');
const { authenticate, requireAdmin } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { idParams } = require('../schemas/common.schema');
const schemas = require('../schemas/module.schema');

const router = express.Router();
const params = idParams('moduleId');
const adminOnly = [authenticate, requireAdmin];

router.get('/', ml.getAll);
router.get('/:moduleId', validate({ params }), ml.getById);
router.post('/', adminOnly, validate({ body: schemas.create }), ml.create);
router.put('/:moduleId', adminOnly, validate({ params, body: schemas.update }), ml.update);
router.delete('/:moduleId', adminOnly, validate({ params }), ml.remove);

module.exports = router;
