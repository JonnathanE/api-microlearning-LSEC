const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const { ObjectId } = mongoose.Schema;

const cardSchema = new mongoose.Schema(
    {
        question: {
            type: String,
            trim: true,
            required: true,
            maxlength: 100,
        },
        gif_url: {
            url: String,
            public_id: String,
        },
        correctAnswer: {
            type: String,
            required: true,
            maxlength: 100,
            trim: true,
        },
        wrongAnswer: {
            type: String,
            required: true,
            maxlength: 100,
            trim: true,
        },
        lesson: {
            type: ObjectId,
            ref: 'Lesson',
            required: true,
            index: true,
        },
    },
    {
        timestamps: true,
    },
);

cardSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Card', cardSchema);
