const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Role = require('../models/Role');

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

exports.isModerator = async (req, res, next) => {
    const user = await User.findById(req.userId);
    const roles = await Role.find({ _id: { $in: user.roles } });
    for (let i = 0; i < roles.length; i++) {
        if (roles[i].name === 'moderator') {
            next();
            return;
        }
    }
    return res.status(403).json({ message: 'Requiere rol de moderador' });
}

exports.isAdmin = async (req, res, next) => {
    const user = await User.findById(req.userId);
    const roles = await Role.find({ _id: { $in: user.roles } });
    for (let i = 0; i < roles.length; i++) {
        if (roles[i].name === 'admin') {
            next();
            return;
        }
    }
    return res.status(403).json({ error: 'Requiere rol de administrador' });
}