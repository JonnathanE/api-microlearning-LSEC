const express = require('express');
const router = express.Router();
const controllersFactory = require('../controllers/controllersFactory');
const { verifyToken, isAdmin } = require('../middlewares/authJwt');
const { cardGif, updateCardGif } = require('../controllers/images.controller');

const factory = new controllersFactory();
const card = factory.getController('card');

// create a new knowledge card
router.post('/', [verifyToken, isAdmin], card.create);
// get the whole card without the gif
router.get('/', card.getAll);
// get knowledge card by id without gif
router.get('/:cardId', card.getById);
// delete knowledge card
router.delete('/:cardId', [verifyToken, isAdmin], card.remove);
// update knowledge card
router.put('/:cardId', [verifyToken, isAdmin], card.update)

// get gif
router.get('/gif/:cardId', cardGif);
// update gif
router.put('/gif/:cardId', [verifyToken, isAdmin], updateCardGif);

router.param('cardId', card.byId);

module.exports = router;