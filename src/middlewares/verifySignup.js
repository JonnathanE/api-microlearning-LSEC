const User = require('../models/User');

/**
 * Methods that are executed before the letter request to the server to verify user authentication
 * @module MiddlewareVerifySignup
 */

/**
 * Methods that verify if the user's email is already registered
 */
exports.checkDuplicateUsernameOrEmail = async (req, res, next) => {
    // the request email is extracted and the database is searched
    const email = await User.findOne({ email: req.body.email });
    // if the email exists, the request is rejected
    if (email) return res.status(400).json({ message: 'El correo electrónico ya existe' });
    next();
}

/**
 * Check if the submitted roles exist in the database
 * @todo implement action if user roles are not submitted
 */
exports.checkRolesExisted = (req, res, next) => {
    // an array is declared with the existing roles
    const ROLES = ['student', 'admin', 'moderator'];
    // it is verified if there are user roles in the request
    if (req.body.roles) {
        // each user role is iterated
        for (let i = 0; i < req.body.roles.length; i++) {
            // compare if the user role exists in the system
            if (!ROLES.includes(req.body.roles[i])) {
                // if the role does not exist, the request is rejected
                return res.status(400).json({
                    message: `El Rol ${req.body.roles[i]} no existe`
                });
            }
        }
    }
    next();
}