const mongoose = require('mongoose');

const { DATABASE, DATABASE_TEST, NODE_ENV } = process.env;
const connectionString = NODE_ENV === 'test'
    ? DATABASE_TEST
    : DATABASE;

if (!connectionString) {
    console.error('Recuerda que tienes que tener un archivo .env con las variables de entorno definidas y el DATABASE que servirá de connection string.');
}

mongoose.connect(connectionString, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
})
    .then(db => {
        if (NODE_ENV !== 'test') {
            console.log('DB is connected')
        } else {
            console.log('DB TEST is connected')
        }
    })
    .catch(err => console.error(err));