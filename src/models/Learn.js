const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const learnSchema = new mongoose.Schema(
    {
        user: {
            type: ObjectId,
            ref: 'User',
            required: true
        },
        lesson: [{
            type: ObjectId,
            ref: 'Lesson'
        }],
        microlearning: [{
            type: ObjectId,
            ref: 'Microlearning'
        }]
    },
    {
        versionKey: false
    }
);

module.exports = mongoose.model('Learn', learnSchema);