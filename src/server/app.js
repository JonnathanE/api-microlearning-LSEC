const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');

// use methods libs
const app = express();
require('dotenv').config();

// Settings
app.set('port', process.env.PORT || 3000);

// Middlewares
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(cors());

// Routes
app.use('/api/user', require('../routes/user.routes'));
app.use('/', (req, res) => {
    res.send('Hola desde el servidor proyecto Microlearning LSEC');
});

module.exports = app;