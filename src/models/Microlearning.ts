import { model, type PaginateModel, Schema, type Types } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import { type Asset, assetDefinition } from './Asset.js';

export interface IMicrolearning {
    title: string;
    lesson: Types.ObjectId;
    image_url?: Asset;
    gif_url?: Asset;
}

const microlearningSchema = new Schema<IMicrolearning>(
    {
        title: {
            type: String,
            trim: true,
            required: true,
            maxlength: 32,
        },
        lesson: {
            type: Schema.Types.ObjectId,
            ref: 'Lesson',
            required: true,
            index: true,
        },
        image_url: assetDefinition,
        gif_url: assetDefinition,
    },
    {
        timestamps: true,
    },
);

microlearningSchema.plugin(mongoosePaginate);

export default model<IMicrolearning, PaginateModel<IMicrolearning>>('Microlearning', microlearningSchema);
