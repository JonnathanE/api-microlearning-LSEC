import Role, { ROLES, type RoleName } from '../models/Role.js';

/**
 * Creates the roles that do not exist yet. Safe to run more than once.
 */
export const ensureRoles = async () => {
    await Role.init();
    await Promise.all(ROLES.map((name) => Role.updateOne({ name }, { $setOnInsert: { name } }, { upsert: true })));
};

export const findByNames = (names: readonly RoleName[]) => Role.find({ name: { $in: names } });
