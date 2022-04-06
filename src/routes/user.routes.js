const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin, verifyAuthorization } = require('../middlewares/authJwt');

const controllersFactory = require('../controllers/controllersFactory');

const factory = new controllersFactory();
const user = factory.getController('user');

/**
 * @todo complete user management methods
 */
// get all users
/* This is a route that will get all the users in the database. */
router.get('/', [verifyToken, isAdmin], user.getAll);
// get user by id
router.get('/find/:userId', [verifyToken, isAdmin], user.getById);
// delete a user by id
router.delete('/:userId', [verifyToken, isAdmin], user.remove);
// update a user
router.put('/:userId', [verifyToken], user.update);

router.param('userId', user.byId);

module.exports = router;