const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const microlearningSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            trin: true,
            required: true,
            maxlength: 32
        },
        lesson: {
            type: ObjectId,
            ref: 'Lesson',
            required: true
        },
        image: {
            data: Buffer,
            contentType: String
        },
        gif: {
            data: Buffer,
            contentType: String
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Microlearning', microlearningSchema);