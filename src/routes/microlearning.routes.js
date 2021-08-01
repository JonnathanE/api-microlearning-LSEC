const express = require('express');
const router = express.Router();
const controllersFactory = require('../controllers/controllersFactory');
const { verifyToken, isAdmin, isModerator } = require('../middlewares/authJwt');
const { microlearningImage, updateMicrolearningImage, microlearningGif, updateMicrolearningGif } = require('../controllers/images.controller');

const factory = new controllersFactory();
const micro = factory.getController('microlearning');

// create microlearning
router.post('/', [verifyToken, isAdmin], micro.create);
// get the whole microlearning without the image and gif
router.get('/', micro.getAll);
// get microlearning by id without image and gif
router.get('/:microId', micro.getById);
// delete microlearning
router.delete('/:microId', [verifyToken, isAdmin],micro.remove);
// update title and lesson of mucrolearnig
router.put('/:microId', [verifyToken, isAdmin], micro.update);

// get image
router.get('/image/:microId', microlearningImage);
// update image
router.put('/image/:microId', [verifyToken, isAdmin], updateMicrolearningImage);
// get gif
router.get('/gif/:microId', microlearningGif);
// update gif
router.put('/gif/:microId', [verifyToken, isAdmin], updateMicrolearningGif);

// method to obtain the parameter
router.param('microId', micro.byId);

module.exports = router;