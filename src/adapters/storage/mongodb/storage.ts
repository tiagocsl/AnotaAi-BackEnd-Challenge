// Gerenal Modules Imports
import { Logger } from "tslog";
// Entities & models Interfaces
import { IUser } from "../../../domain/user/user";
import { ICategory } from "../../../domain/category/category";
import { IProduct } from "../../../domain/product/product";
// StoragePorts Interfaces
import { CategoryModel, UserModel, ProductModel } from "./models";
import { IUserStoragePort } from "../../../domain/user/port";
import { ICategoryStoragePort } from "../../../domain/category/port";
import { IProductStoragePort } from "../../../domain/product/port";

export default class MongoStorage implements IUserStoragePort, ICategoryStoragePort, IProductStoragePort {
    user = UserModel;
    category = CategoryModel;
    product = ProductModel;
    constructor(
        private logger: Logger
    ) { }


    /**
     * 
     *  User Storage Methods
     * 
     **/

    async persistUser(user: IUser): Promise<IUser> {
        let _user;
        try {
            this.logger.info(`Trying to persist an user`);
            this.logger.info(`UserData: ${JSON.stringify({ ...user, password: '' })}`);
            _user = await this.user.create(user);
        } catch (error) {
            this.logger.error('Unable to persist user');
            throw new Error('Unable to register user');
        }
        return _user as IUser;
    }

    async findUserById(id: string): Promise<IUser | null> {
        let _user = await this.user.findOne({ _id: id }).exec()
        return _user
    }

    async findUserByEmail(email: string): Promise<IUser | null> {
        let _user = await this.user.findOne({ email: email }).exec()
        return _user
    }

    /**
     * 
     *  Category Storage Methods
     * 
     **/

    async persistCategory(category: ICategory): Promise<ICategory> {
        let _category;
        try {
            this.logger.info(`Trying to persist an category`);
            this.logger.info(`CategoryData: ${JSON.stringify(category)}`);
            _category = await this.category.create(category);
        } catch (error) {
            this.logger.error('Unable to persist category');
            throw new Error('Unable to register category');
        }
        return _category as ICategory;
    }

    async findCategoryById(id: string): Promise<ICategory | null> {
        let _category = await this.category.findOne({ _id: id }).exec()
        return _category
    }

    async findCategoryByName(name: string): Promise<ICategory | null> {
        let _category = await this.category.findOne({ name: name }).exec()
        return _category
    }

    async listAllCategories(): Promise<ICategory[]> {
        let _categories = await this.category.find().exec()
        return _categories
    }

    async listCategoriesThatContainSpecificCharactersInTheName(searchString: string): Promise<ICategory[] | null> {
        let _categories = await this.category.find({ name: { $regex: searchString, $options: "i" } }).exec()
        return _categories
    }

    /**
     * 
     *  Product Storage Methods
     * 
     **/

    async persistProduct(product: IProduct): Promise<IProduct> {
        let _product;
        try {
            this.logger.info(`Trying to persist an product`);
            this.logger.info(`ProductData: ${JSON.stringify(product)}`);
            _product = await this.product.create(product);
        } catch (error) {
            this.logger.error('Unable to persist product');
            throw new Error('Unable to register product');
        }
        return _product as IProduct;
    }

    async findProductById(id: string): Promise<IProduct | null> {
        let _product = await this.product.findOne({ _id: id }).exec();
        if (!_product) return null;
        return _product
    }

    async listAllProducts(): Promise<IProduct[] | null> {
        let _product = await this.product.find().exec()
        return _product
    }

    async listAllProductsByCategory(categories: string[]): Promise<IProduct[] | null> {
        let _product = await this.product.find().where('category').all(categories).exec()
        return _product
    }

    async listProductsThatContainSpecificCharactersInTheName(searchString: string): Promise<IProduct[] | null> {
        let _product = await this.product.find({ name: { $regex: searchString, $options: "i" } }).exec()
        return _product
    }

    async updateProduct(id: string, newProductData: IProduct): Promise<any> {
        await this.product.updateOne({ _id: id }, newProductData).exec()
        return;
    }

    async deleteProduct(id: string): Promise<any> {
        await this.product.deleteOne({ _id: id }).exec()
        return;
    }

}