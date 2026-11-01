const argon2 = require('argon2');
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
            required: true,
            maxlength: 32,
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
            select: false,
        },
        roles: [
            {
                ref: 'Role',
                type: ObjectId,
            },
        ],
    },
    {
        timestamps: true,
        versionKey: false,
        toJSON: {
            transform: (doc, ret) => {
                delete ret.password;
                return ret;
            },
        },
    },
);

userSchema.pre('save', async function () {
    if (this.isModified('password')) this.password = await argon2.hash(this.password);
});

userSchema.methods = {
    /** The password must have been selected in the query: .select('+password') */
    verifyPassword(plainText) {
        return argon2.verify(this.password, plainText);
    },

    /** The roles must have been populated in the query */
    hasRole(name) {
        return this.roles.some((role) => role.name === name);
    },
};

module.exports = mongoose.model('User', userSchema);
