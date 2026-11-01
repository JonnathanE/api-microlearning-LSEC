const mongoose = require('mongoose');

const ROLES = ['student', 'moderator', 'admin'];

const roleSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            enum: ROLES,
            required: true,
            unique: true,
        },
    },
    {
        versionKey: false,
    },
);

module.exports = mongoose.model('Role', roleSchema);
module.exports.ROLES = ROLES;
