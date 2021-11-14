const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Role = require('../models/Role');

/**
 * Methods that are executed before the letter request to the server to identify the validity of the token and user roles
 * @module MiddlewareAuthJwt
 */

/**
 * Method to check if the user's token is valid
 */
exports.verifyToken = async (req, res, next) => {
    try {
        // extract token from http header
        const bearerHeader = req.headers['authorization'];
        if (!bearerHeader) return res.status(403).json({ error: 'No se proporcionó token' });
        // I separate the Bearer from the Token
        const bearer = bearerHeader.split(' ');
        const token = bearer[1];
        // we verify the token and extract the id of the user
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded._id;
        // we check if the user exists with the user id extracted from the token
        const user = await User.findById(req.userId, { password: 0 });
        if (!user) return res.status(404).json({ error: 'Ningún usuario encontrado' });

        next();
    } catch (error) {
        res.status(401).json({ error: 'No autorizado' });
    }
}

/**
 * Method to verify if the user is a moderator
 */
exports.isModerator = async (req, res, next) => {
    // Obtains the user according to the id that is sent by the request
    const user = await User.findById(req.userId);
    // get the roles from the database that match the user
    const roles = await Role.find({ _id: { $in: user.roles } });
    // it is checked if it has the moderator role
    for (let i = 0; i < roles.length; i++) {
        if (roles[i].name === 'moderator') {
            next();
            return;
        }
    }
    return res.status(403).json({ message: 'Requiere rol de moderador' });
}

/**
 * Method to verify if the user is a admin
 */
exports.isAdmin = async (req, res, next) => {
    // Obtains the user according to the id that is sent by the request
    const user = await User.findById(req.userId);
    // get the roles from the database that match the user
    const roles = await Role.find({ _id: { $in: user.roles } });
    // it is checked if it has the admin role
    for (let i = 0; i < roles.length; i++) {
        if (roles[i].name === 'admin') {
            next();
            return;
        }
    }
    return res.status(403).json({ error: 'Requiere rol de administrador' });
}