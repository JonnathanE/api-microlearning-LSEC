const User = require('../controllers/user.controller');



class controllersFactory {
    factory = (option) => {
        if (option === 'user') {
            const user = new User();
            return user;
        }
    }
}

module.exports = controllersFactory;