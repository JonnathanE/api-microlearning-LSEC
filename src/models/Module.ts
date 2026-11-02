import { model, Schema } from 'mongoose';

export interface IModule {
    number: number;
    name: string;
}

const moduleSchema = new Schema<IModule>(
    {
        number: {
            type: Number,
            required: true,
            unique: true,
        },
        name: {
            type: String,
            trim: true,
            required: true,
            maxlength: 32,
            unique: true,
        },
    },
    {
        timestamps: true,
    },
);

export default model<IModule>('Module', moduleSchema);
