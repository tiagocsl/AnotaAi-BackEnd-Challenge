import { Document, Model } from "mongoose";

export interface IProduct {
    id?: any;
    name: string;
    description: string;
    price: number;
    category: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IProductDocument extends IProduct, Document { }
export interface IProductModel extends Model<IProductDocument> { }
