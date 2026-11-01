const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema(
    {
        number: {
            type: Number,
            required: true,
            unique: true,
        },
        name: {
            type: String,
            trim: true,
            required: true,
            maxlength: 32,
            unique: true,
        },
    },
    {
        timestamps: true,
    },
);

module.exports = mongoose.model('Module', moduleSchema);
