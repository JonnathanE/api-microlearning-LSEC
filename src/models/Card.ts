import { model, type PaginateModel, Schema, type Types } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import { type Asset, assetDefinition } from './Asset.js';

export interface ICard {
    question: string;
    gif_url?: Asset;
    correctAnswer: string;
    wrongAnswer: string;
    lesson: Types.ObjectId;
}

const cardSchema = new Schema<ICard>(
    {
        question: {
            type: String,
            trim: true,
            required: true,
            maxlength: 100,
        },
        gif_url: assetDefinition,
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
            type: Schema.Types.ObjectId,
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

export default model<ICard, PaginateModel<ICard>>('Card', cardSchema);
