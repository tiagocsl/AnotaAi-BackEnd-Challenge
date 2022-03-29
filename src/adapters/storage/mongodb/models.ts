import { model } from "mongoose";

import { CategorySchema, ProductSchema, UserSchema } from "./schemas";

import { IProductDocument } from "../../../domain/product/product";
import { IUserDocument } from "../../../domain/user/user";
import { ICategory } from "../../../domain/category/category";


export const UserModel = model<IUserDocument>("User", UserSchema);
export const ProductModel = model<IProductDocument>("Product", ProductSchema);
export const CategoryModel = model<ICategory>("Category", CategorySchema);