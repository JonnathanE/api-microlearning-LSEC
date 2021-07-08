const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const lessonSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
            required: true,
            maxlength: 32
        },
        module: {
            type: ObjectId,
            ref: 'Module',
            required: true
        },
        icon: {
            data: Buffer,
            contentType: String
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Lesson', lessonSchema);