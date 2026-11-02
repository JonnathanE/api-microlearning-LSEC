import { connectDatabase, disconnectDatabase } from '../config/database.js';
import env from '../config/env.js';
import { ROLES } from '../models/Role.js';
import User from '../models/User.js';
import { newPassword } from '../schemas/auth.schema.js';
import * as roleService from '../services/role.service.js';

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
        roles: await roleService.findByNames(ROLES),
    });
    console.log(`Admin user ${ADMIN_EMAIL} created`);
};

seed()
    .catch((error) => {
        console.error(error);
        process.exitCode = 1;
    })
    .finally(disconnectDatabase);
