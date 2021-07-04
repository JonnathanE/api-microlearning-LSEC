const User = require('../models/User');

exports.checkDuplicateUsernameOrEmail = async (req, res, next) => {
    const email = await User.findOne({ email: req.body.email });
    if (email) return res.status(400).json({ message: 'El correo electrónico ya existe' });
    next();
}

// check if the submitted roles exist in the database
exports.checkRolesExisted = (req, res, next) => {
    const ROLES = ['student', 'admin', 'moderator'];
    if (req.body.roles) {
        for (let i = 0; i < req.body.roles.length; i++) {
            if (!ROLES.includes(req.body.roles[i])) {
                return res.status(400).json({
                    message: `El Rol ${req.body.roles[i]} no existe`
                });
            }
        }
    }
    next();
}