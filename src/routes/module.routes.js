const express = require('express');
const router = express.Router();
const controllersFactory = require('../controllers/controllersFactory');

const factory = new controllersFactory();
const ml = factory.getController('module');

router.post('/create', ml.create);

module.exports=router;