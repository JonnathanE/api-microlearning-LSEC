'use strict';
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Role = require('../models/Role');
const Learn = require('../models/Learn');
/**
 * Class to manage user authentication
 */
class Auth {

    /**
     * Signup Create a new user (client and administrators) according to the roles (student, admin, moderator)
     * @param {{body:{name: string, email: string, password: string, roles: Array<string>}}} req It is the form data to create a new user
     * @param {{}} res Http response parameter
     * @returns {JSON}
     */
    signup = async (req, res) => {
        // get user data
        const { name, email, password, roles } = req.body;
        const user = new User({
            name,
            email,
            password
        });
        // check if roles were sent, otherwise the student role will be set by default
        if (roles) {
            const foundRole = await Role.find({ name: { $in: roles } });
            user.roles = foundRole.map(role => role._id);
        } else {
            const role = await Role.findOne({ name: 'student' });
            user.roles = [role._id];
        }
        // saves the new user to the database and returns the user data in JSON format.
        await user.save(async (error, user) => {
            if (error) return res.status(400).json({
                message: 'Verifique los campos, hubo un error'
            });
            user.salt = undefined;
            user.hashed_password = undefined;
            // a user Learn record is created that stores the user's learning
            const learn = new Learn({ user });
            const learnSave = await learn.save();
            //returns the user data (_id, name, email, roles)
            res.status(200).json({ user });
        });
    }

    /**
     * Method to log in users and administrators
     * @param {{body: {email: string, password: string}}} req Data that is sent from the form to log in
     * @param {{}} res Http response parameter
     * @returns {JSON}
     */
    sigin = async (req, res) => {
        const { email, password } = req.body;
        // find the user based on email
        await User.findOne({ email }, (error, user) => {
            if (error || !user)
                return res.status(400).json({ error: 'El usuario con ese correo electrónico no existe' });
            // if the user is found, make sure the email and password match
            // call the authentication method in the user model
            if (!user.authenticate(password))
                return res.status(401).json({ error: 'El correo electrónico o la contraseña no coinciden' });
            // crear el token con vencimiento en 24 horas
            const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: 86400 });
            // persist the token as 't' in cookie with expiration date
            res.cookie('t', token, { expire: new Date() + 9999 });
            // return response with user and token to frontend client
            const { _id, name, email, roles } = user;
            return res.status(200).json({ token, user: { _id, email, name, roles } });
        }).populate("roles");
    }

    /**
     * Method to log out user. The cookie that contains the token in the frontend part is deleted
     * @param {{}} res Http response parameter
     * @returns {JSON}
     */
    signout = (req, res) => {
        // delete cookie containing token
        res.clearCookie('t');
        res.status(200).json({ message: 'Éxito de Cerrar Sesión' })
    }
}

module.exports = Auth;