import { Document, Model } from "mongoose";

export interface IUser {
    id?: any;
    firstName: string;
    lastName: String;
    email: string;
    password: string;
    birthdate: Date;
    role: string,
    createdAt: Date;
    updatedAt: Date;
}

export interface IUserDocument extends IUser, Document { }
export interface IUserModel extends Model<IUserDocument> { }
