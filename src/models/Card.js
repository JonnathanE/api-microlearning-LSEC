const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
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
        gif_url: {
            url: String,
            public_id: String
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

cardSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Card', cardSchema);