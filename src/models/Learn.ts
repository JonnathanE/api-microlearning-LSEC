import { model, Schema, type Types } from 'mongoose';

export interface ILearn {
    user: Types.ObjectId;
    lesson: Types.ObjectId[];
    microlearning: Types.ObjectId[];
}

const learnSchema = new Schema<ILearn>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
        },
        lesson: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Lesson',
            },
        ],
        microlearning: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Microlearning',
            },
        ],
    },
    {
        versionKey: false,
    },
);

export default model<ILearn>('Learn', learnSchema);
