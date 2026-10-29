require('dotenv').config();
const mongoose = require('mongoose');
const Role = require('../models/Role');
const User = require('../models/User');
const Learn = require('../models/Learn');

/**
 * Creates the roles and the initial admin user. Safe to run more than once.
 * Usage: pnpm seed
 */
const seed = async () => {
    const { DATABASE, ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
    if (!DATABASE) throw new Error('DATABASE is not defined in .env');

    await mongoose.connect(DATABASE, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true
    });

    // create the roles that do not exist yet
    for (const name of ['student', 'moderator', 'admin']) {
        await Role.updateOne({ name }, { $setOnInsert: { name } }, { upsert: true });
    }
    console.log('Roles ready');

    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
        console.log('ADMIN_EMAIL or ADMIN_PASSWORD not defined, admin user skipped');
        return;
    }
    if (await User.exists({ email: ADMIN_EMAIL })) {
        console.log(`Admin user ${ADMIN_EMAIL} already exists`);
        return;
    }
    const roles = await Role.find({ name: { $in: ['student', 'moderator', 'admin'] } });
    const admin = await new User({
        name: ADMIN_NAME || 'admin',
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        roles: roles.map(role => role._id)
    }).save();
    // every user needs a Learn record to store their progress
    await new Learn({ user: admin._id }).save();
    console.log(`Admin user ${ADMIN_EMAIL} created`);
};

seed()
    .catch(error => {
        console.error(error);
        process.exitCode = 1;
    })
    .finally(() => mongoose.disconnect());
