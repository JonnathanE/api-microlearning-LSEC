const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const cardSchema = new mongoose.Schema(
    {
        question: {
            type: String,
            trin: true,
            required: true,
            maxlength: 100
        },
        gif: {
            data: Buffer,
            contentType: String
        },
        correctAnswer: {
            type: String,
            required: true,
            maxlength: 100,
            trin: true
        },
        wrongAnswer: {
            type: String,
            required: true,
            maxlength: 100,
            trin: true
        },
        lesson: {
            type: ObjectId,
            ref: 'Lesson',
            required: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Card', cardSchema);