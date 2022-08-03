'use strict';
const UserSchema = require('../models/User');
/**
 * Class to manage users
 * @todo Implement methods of creating, updating, deleting and searching for users
 */
class User {

    /* The getAll function is a wrapper around the find() method. It takes a query parameter called
    new, which is set to true by default. If the query parameter is set to false, the find() method
    will return all the users in the database. If the query parameter is set to true, the find()
    method will return the last 5 users created.
    
    The queryLimit parameter is set to 5 by default. If the query parameter is set to a number, the
    find() method will return that number of users.
    
    The try/catch block is used to handle any errors that */
    getAll = async (req, res) => {
        const queryNew = req.query.new; // return the last account created
        let queryLimit = parseInt(req.query.limit, 10) || 5; // the number of accounts to return
        try {
            const users = queryNew
                ? await UserSchema.find().populate("roles").sort({ _id: -1 }).limit(queryLimit)
                : await UserSchema.find().populate("roles");
            res.status(200).json(users);
        } catch (error) {
            res.status(500).json(error);
        }
    }

    /* Get the user's data by their id. */
    getById = async (req, res) => {
        try {
            const { hashed_password, salt, ...others } = req.user._doc;
            res.status(200).json(others);
        } catch (error) {
            res.status(500).json(error);
        }
    }

    /* Get the user's data by their toekn. */
    getByToken = async (req, res) => {
        try {
            // search user by id
            await UserSchema.findById(req.userId).populate("roles")
                .exec((err, user) => {
                    if (err || !user) return res.status(400).json({ error: 'El usuario no se encontró o no existe' });
                    const { hashed_password, salt, roles, _id, ...others } = user._doc;
                    res.status(200).json(others);
                });
        } catch (error) {
            res.status(500).json(error);
        }
    }

    /* The user is retrieved from the request object, and then the user is removed.
    
    The user is removed by calling the remove() method on the user object.
    
    The remove() method returns a promise, so we can use the .then() method to handle the response.
    
    The .then() method takes a callback function that is called when the promise is resolved.
    
    The callback function is called with the value of the promise.
    
    The .then() method returns a new promise, so we can chain another .then() method to handle the
    response.
    
    The */
    remove = async (req, res) => {
        try {
            const user = req.user;
            await user.remove();
            res.status(200).json('El usuario fue eliminado');
        } catch (error) {
            res.status(500).json(error);
        }
    }

    /* Update the user's name, email, and password. */
    update = async (req, res) => {
        const { name, email, password } = req.body;
        try {
            const user = req.user;
            if (name) user.name = name;
            if (email) user.email = email;
            if (password) user.hashed_password = user.encryptPassword(password);

            const updateUser = await user.save();

            res.status(200).json(updateUser);
        } catch (error) {
            res.status(500).json(error);
        }
    }

    /* The byId function is used to find a user by its id. The user is saved in the request object. The
    next function is called to continue with the next process.
    
    The byId function is called in the routes.js file.
    */
    byId = async (req, res, next, id) => {
        // search user by id
        await UserSchema.findById(id).populate("roles")
            .exec((err, user) => {
                if (err || !user) return res.status(400).json({ error: 'El usuario no se encontró o no existe' });
                // save the user found in the request
                req.user = user;
                // continue with the next process
                next();
            });
    }
}

module.exports = User;