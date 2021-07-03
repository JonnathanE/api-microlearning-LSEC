const User = require('../controllers/user.controller');
const Module = require('../controllers/module.controller');
class controllersFactory {
    getController = (option) => {
        if (option === 'user') return new User();
        if (option === 'module') return new Module;
    }
}

module.exports = controllersFactory;