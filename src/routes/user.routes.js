const express = require('express');
const user = require('../controllers/user.controller');
const { authenticate, requireAdmin, requireSelfOrAdmin } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { idParams } = require('../schemas/common.schema');
const schemas = require('../schemas/user.schema');

const router = express.Router();
const params = idParams('userId');

router.use(authenticate);
router.get('/', requireAdmin, validate({ query: schemas.listQuery }), user.getAll);
router.get('/find', user.getCurrent);
router.get('/find/:userId', requireAdmin, validate({ params }), user.getById);
router.put('/:userId', validate({ params, body: schemas.update }), requireSelfOrAdmin, user.update);
router.put('/:userId/roles', requireAdmin, validate({ params, body: schemas.updateRoles }), user.updateRoles);
router.delete('/:userId', requireAdmin, validate({ params }), user.remove);

module.exports = router;
