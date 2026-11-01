const env = require('../config/env');
const { connectDatabase, disconnectDatabase } = require('../config/database');
const Role = require('../models/Role');
const User = require('../models/User');
const { newPassword } = require('../schemas/auth.schema');
const roleService = require('../services/role.service');

/**
 * Creates the roles and the initial admin user. Safe to run more than once.
 * Usage: pnpm seed
 */
const seed = async () => {
    const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = env;
    await connectDatabase();
    await roleService.ensureRoles();
    console.log('Roles ready');

    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
        console.log('ADMIN_EMAIL or ADMIN_PASSWORD not defined, admin user skipped');
        return;
    }
    if (await User.exists({ email: ADMIN_EMAIL })) {
        console.log(`Admin user ${ADMIN_EMAIL} already exists`);
        return;
    }
    await User.create({
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        password: newPassword.parse(ADMIN_PASSWORD),
        roles: await roleService.findByNames(Role.ROLES),
    });
    console.log(`Admin user ${ADMIN_EMAIL} created`);
};

seed()
    .catch((error) => {
        console.error(error);
        process.exitCode = 1;
    })
    .finally(disconnectDatabase);
