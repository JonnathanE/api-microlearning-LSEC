import { model, Schema, type Types } from 'mongoose';
import { type Asset, assetDefinition } from './Asset.js';

export interface ILesson {
    name: string;
    module: Types.ObjectId;
    icon_url?: Asset;
}

const lessonSchema = new Schema<ILesson>(
    {
        name: {
            type: String,
            trim: true,
            required: true,
            maxlength: 32,
        },
        module: {
            type: Schema.Types.ObjectId,
            ref: 'Module',
            required: true,
            index: true,
        },
        icon_url: assetDefinition,
    },
    {
        timestamps: true,
    },
);

export default model<ILesson>('Lesson', lessonSchema);
