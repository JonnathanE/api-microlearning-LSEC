const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema(
    {
        number: {
            type: Number,
            required: true,
            unique: true
        },
        name: {
            type: String,
            required: true,
            maxlength: 32,
            unique: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Module', moduleSchema);