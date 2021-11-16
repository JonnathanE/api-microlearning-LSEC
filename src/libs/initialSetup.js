const { Promise } = require('mongoose');
const Role = require('../models/Role');

/**
 * Modules that are run when the server starts
 * @module InitialSetup
 */

/**
 * Method to create the roles in the database
 */
exports.createRoles = async () => {
    try {
        // check if there are documents in the Role model
        // returns the number of documents created
        const count = await Role.estimatedDocumentCount();
        // if the count is greater, it means that there are documents created
        if (count > 0) return;
        // promise to run all functions at the same time
        // inside the promise the roles are created
        const values = await Promise.all([
            new Role({ name: "student" }).save(),
            new Role({ name: "moderator" }).save(),
            new Role({ name: "admin" }).save()
        ]);
        console.log(values);
    } catch (error) {
        console.error(error);
    }
}