import { Document, Model } from "mongoose";

export interface ICategory {
    id?: any;
    name: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface ICategoryDocument extends ICategory, Document { }
export interface ICategoryModel extends Model<ICategoryDocument> { }
