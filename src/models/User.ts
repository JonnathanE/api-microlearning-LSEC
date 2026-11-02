import argon2 from 'argon2';
import { type HydratedDocument, type Model, model, type PopulatedDoc, Schema, type Types } from 'mongoose';
import type { IRole, RoleDocument, RoleName } from './Role.js';

export interface IUser {
    name: string;
    email: string;
    password: string;
    roles: PopulatedDoc<RoleDocument, Types.ObjectId>[];
    createdAt: Date;
    updatedAt: Date;
}

interface IUserMethods {
    /** The password must have been selected in the query: .select('+password') */
    verifyPassword(plainText: string): Promise<boolean>;
    /** The roles must have been populated in the query */
    hasRole(name: RoleName): boolean;
}

export type UserDocument = HydratedDocument<IUser, IUserMethods>;

type UserModel = Model<IUser, object, IUserMethods>;

const userSchema = new Schema<IUser, UserModel, IUserMethods>(
    {
        name: {
            type: String,
            trim: true,
            required: true,
            maxlength: 32,
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
            select: false,
        },
        roles: [
            {
                ref: 'Role',
                type: Schema.Types.ObjectId,
            },
        ],
    },
    {
        timestamps: true,
        versionKey: false,
        toJSON: {
            transform: (doc, ret: Partial<IUser>) => {
                delete ret.password;
                return ret;
            },
        },
    },
);

userSchema.pre('save', async function () {
    if (this.isModified('password')) this.password = await argon2.hash(this.password);
});

userSchema.method('verifyPassword', function (this: UserDocument, plainText: string) {
    return argon2.verify(this.password, plainText);
});

userSchema.method('hasRole', function (this: UserDocument, name: RoleName) {
    return this.roles.some((role) => (role as IRole).name === name);
});

export default model<IUser, UserModel>('User', userSchema);
