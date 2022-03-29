import { Schema, } from 'mongoose'
import moment from 'moment'

export const UserSchema = new Schema({
    firstName: String,
    lastName: String,
    email: String,
    password: String,
    birthDate: Date,
    role: String,
    createdAt: { type: Date },
    updatedAt: {
        type: Date,
        default: moment(Date.now()).format("YYYY-MM-DD")
    }
});

export const CategorySchema = new Schema({
    name: String,
    description: String,
    createdAt: { type: Date },
    updatedAt: {
        type: Date,
        default: moment(Date.now()).format("YYYY-MM-DD")
    }
});

export const ProductSchema = new Schema({
    name: String,
    description: String,
    price: Number,
    category: String,
    createdAt: { type: Date },
    updatedAt: {
        type: Date,
        default: moment(Date.now()).format("YYYY-MM-DD")
    }
});