const express = require('express');
const fileUpload = require('express-fileupload');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');
const { createRoles } = require('../libs/initialSetup');

// use methods libs
const app = express();
require('dotenv').config();
createRoles();

// Settings
app.set('port', process.env.PORT || 3000);

// Middlewares
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(cors());
app.use(fileUpload({
    useTempFiles : true,
    tempFileDir : './upload'
}));

// Routes
app.use('/api/user', require('../routes/user.routes'));
app.use('/api/module', require('../routes/module.routes'));
app.use('/api/auth', require('../routes/auth.routes'));
app.use('/api/lesson', require('../routes/lesson.routes'));
app.use('/api/micro', require('../routes/microlearning.routes'));
app.use('/api/home', require('../routes/home.routes'));
app.use('/api/card', require('../routes/card.routes'));
app.use('/', (req, res) => {
    res.send('Hola desde el servidor proyecto Microlearning LSEC');
});

module.exports = app;