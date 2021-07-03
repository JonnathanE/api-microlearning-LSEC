const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;
const crypto = require('crypto');
const { v1: uuidv1 } = require('uuid');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
            maxlength: 32
        },
        email: {
            type: String,
            trim: true,
            required: true,
            unique: true
        },
        hashed_password: {
            type: String,
            required: true
        },
        salt: String,
        roles: [{
            ref: "Role",
            type: ObjectId
        }]
    },
    {
        timestamps: true,
        versionKey: false
    }
);
// virtual field for password hash
userSchema.virtual('password')
    .set(function (password) {
        this._password = password;
        this.salt = uuidv1();
        this.hashed_password = this.encryptPassword(password);
    })
    .get(function () {
        return this._password;
    });

// Methoss of Schema
userSchema.methods = {
    authenticate: function (plainText) {
        return this.encryptPassword(plainText) === this.hashed_password;
    },

    encryptPassword: function (password) {
        if (!password) return '';
        try {
            return crypto.createHmac('sha1', this.salt)
                .update(password)
                .digest('hex')
        } catch (error) {
            return error;
        }
    }
};

module.exports = mongoose.model('User', userSchema);