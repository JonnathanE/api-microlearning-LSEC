const app = require('./server/app');

// database
require('./database');

// starting the server
const server = app.listen(app.get('port'), () => {
    console.log('Server on port', app.get('port'));
});

module.exports = { app, server };