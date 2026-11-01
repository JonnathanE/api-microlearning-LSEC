const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const { ObjectId } = mongoose.Schema;

const microlearningSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            trim: true,
            required: true,
            maxlength: 32,
        },
        lesson: {
            type: ObjectId,
            ref: 'Lesson',
            required: true,
            index: true,
        },
        image_url: {
            url: String,
            public_id: String,
        },
        gif_url: {
            url: String,
            public_id: String,
        },
    },
    {
        timestamps: true,
    },
);

microlearningSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Microlearning', microlearningSchema);
