const mongoose = require('mongoose');

// get environment variables
const { DATABASE, DATABASE_TEST, NODE_ENV } = process.env;
// get the database address according to whether the environment is testing or production
const connectionString = NODE_ENV === 'test'
    ? DATABASE_TEST
    : DATABASE;

// it is verified if the database address exists in the environment variables
if (!connectionString) {
    console.error('Remember that you have to have a .env file with the environment variables defined and the DATABASE that will serve as the connection string.');
}

// make the connection to the database
mongoose.connect(connectionString, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
})
    .then(db => {
        if (NODE_ENV !== 'test') {
            console.log('DB is connected to', db.connection.name)
        } else {
            console.log('DB TEST is connected')
        }
    })
    .catch(err => console.error(err));