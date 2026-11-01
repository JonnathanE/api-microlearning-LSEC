const Role = require('../models/Role');

/**
 * Creates the roles that do not exist yet. Safe to run more than once.
 */
const ensureRoles = async () => {
    await Role.init();
    await Promise.all(Role.ROLES.map((name) => Role.updateOne({ name }, { $setOnInsert: { name } }, { upsert: true })));
};

const findByNames = (names) => Role.find({ name: { $in: names } });

module.exports = { ensureRoles, findByNames };
