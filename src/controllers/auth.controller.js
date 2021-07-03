'use strict';
const User = require('../models/User');
const Role = require('../models/Role');

class Auth {
    signup = async (req, res) => {
        const { name, email, password, roles } = req.body;
        const user = new User({
            name,
            email,
            password
        });
        if (roles) {
            const foundRole = await Role.find({name: {$in: roles}});
            user.roles = foundRole.map(role => role._id);
        } else {
            const role = await Role.findOne({name: 'student'});
            user.roles = [role._id];
        }
        console.log('Primero')
        await user.save((error, user) => {
            if (error) return res.status(400).json({
                message: 'Verifique los campos, hubo un error'
            });
            console.log('segundo jeje')
            user.salt = undefined;
            user.hashed_password = undefined;
            res.status(200).json({user});
        });
    }
}

module.exports = Auth;