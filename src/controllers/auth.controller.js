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
            // crear el token con vencimiento en 24 horas
            const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: 86400 });
            // I get relevant information from the user to send as a response
            const { name, email, ...other } = user._doc;
            //returns the user data ( name, email)
            res.status(200).json({ token, name, email });
        });
    }

    /**
     * Method to log in users
     * @param {{body: {email: string, password: string}}} req Data that is sent from the form to log in
     * @param {{}} res Http response parameter
     * @returns {JSON}
     */
    sigin = async (req, res) => {
        const { email, password } = req.body;
        // find the user based on email
        await User.findOne({ email }, (error, user) => {
            if (error || !user) {
                return res.status(400).json({ error: 'El usuario con ese correo electrónico no existe' });
            }
            // if the user is found, make sure the email and password match
            // call the authentication method in the user model
            if (!user.authenticate(password)) {
                return res.status(401).json({ error: 'El correo electrónico o la contraseña no coinciden' });
            }
            // crear el token con vencimiento en 24 horas
            const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: 86400 });
            // persist the token as 't' in cookie with expiration date
            res.cookie('t', token, { expire: new Date() + 9999 });
            // return response with user and token to frontend client
            const { name, email } = user;
            return res.status(200).json({ token, name, email });
        }).populate("roles");
    }

    /**
     * Method to log in administrators
     * @param {{body: {email: string, password: string}}} req Data that is sent from the form to log in
     * @param {{}} res Http response parameter
     * @returns {JSON}
     */
    siginAdmin = async (req, res) => {
        const { email, password } = req.body;
        // find the user based on email
        const user = await User.findOne({ email });
        // check if user exists
        if (!user) {
            return res.status(400).json({ error: 'El usuario o la contraseña están incorrectos' });
        }
        // if the user is found, make sure the email and password match
        // call the authentication method in the user model
        if (!user.authenticate(password)) {
            return res.status(401).json({ error: 'El correo electrónico o la contraseña no coinciden' });
        }
        // get all user roles
        const roles = await Role.find({ _id: { $in: user.roles } });
        // it is checked if it has the admin role
        let isAdmin = false;
        for (let i = 0; i < roles.length; i++) {
            if (roles[i].name === 'admin') {
                isAdmin = true;
            }
        }
        // if you are not an administrator, an error is returned
        if (!isAdmin) {
            return res.status(401).json({ error: 'No tiene los permisos para ingresar a la página' });
        }
        // crear el token con vencimiento en 24 horas
        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: 86400 });
        // persist the token as 't' in cookie with expiration date
        res.cookie('t', token, { expire: new Date() + 9999 });
        // return response with user and token to frontend client
        const { name } = user;
        return res.status(200).json({ token, name, email, role: ["admin"] });
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