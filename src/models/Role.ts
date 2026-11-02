import { type HydratedDocument, model, Schema } from 'mongoose';

export const ROLES = ['student', 'moderator', 'admin'] as const;

export type RoleName = (typeof ROLES)[number];

export interface IRole {
    name: RoleName;
}

export type RoleDocument = HydratedDocument<IRole>;

const roleSchema = new Schema<IRole>(
    {
        name: {
            type: String,
            enum: ROLES,
            required: true,
            unique: true,
        },
    },
    {
        versionKey: false,
    },
);

export default model<IRole>('Role', roleSchema);
