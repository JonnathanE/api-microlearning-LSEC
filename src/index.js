const app = require('./server/app');

// database
require('./database');

// starting the server
app.listen(app.get('port'), ()=>{
    console.log('Server on port', app.get('port'));
});