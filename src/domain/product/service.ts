// General Modules Imports
import { Logger } from 'tslog';
import { isObjectIdOrHexString } from 'mongoose'
// Port Interfaces
import { ICategoryServicePort } from '../category/port';
import { IProductServicePort, IProductStoragePort } from './port';
// Entity Interface
import { IProduct } from './product'

import * as generalExceptions from "../_exceptions/generalExceptions"

export default class ProductService implements IProductServicePort {
    constructor(
        private logger: Logger,
        private storage: IProductStoragePort,
        private categoryService: ICategoryServicePort
    ) { }

    async createProduct(product: IProduct, email: string): Promise<IProduct | undefined> {
        await this.categoryService.findCategoryByName(product.category, email);
        this.logger.info(`User '${email}' is registering a product with the name: '${product.name}'.`);
        const nameNormalized = product.name.toLowerCase().replace(/^(.)|\s+(.)/g, c => c.toUpperCase()); // exAmPle naMe => Example Name
        const descriptionNormalized = product.description.toLowerCase().replace(/^(.)|\s+(.)/g, c => c.toUpperCase()); // exAmPle deScRiPtiOn => Example Description
        const createdAtNormalized: Date = new Date();
        const _product = await this.storage.persistProduct({ ...product, name: nameNormalized, description: descriptionNormalized, createdAt: createdAtNormalized });
        this.logger.info(`Successful register product with the name: '${nameNormalized}'.`);

        return _product as IProduct;
    }

    async findProductById(id: string, email: string): Promise<IProduct | null> {
        if (!isObjectIdOrHexString(id)) throw new generalExceptions.InvalidFieldType("The type of field ID dont corresponding with type of ObjectId of Mongo.")
        this.logger.info(`User '${email}' requesting details of a product with ID: '${id}'.`)
        const _product = await this.storage.findProductById(id);
        if (!_product) {
            this.logger.error('There is no product with that id.');
            throw new generalExceptions.DoesNotExistError('There is no product with that id.');
        }

        return _product as IProduct;
    }

    async listProducts(categories: string | undefined, searchString: string | undefined, email: string): Promise<IProduct[] | null> {
        let _categories: string[] = [];
        let _products: IProduct[] | null = []

        if (!!categories && !!searchString) {
            _categories = categories.split(',');
            _products = await this.listAllProductsByCategory(_categories, email);
            _products = _products?.filter((values) => {
                return values.name.toLowerCase().includes(searchString.toLowerCase());
            }) as IProduct[];
        }
        else if (!!categories && !searchString) {
            _categories = categories.split(',');
            _products = await this.listAllProductsByCategory(_categories, email);
        }
        else if (!categories && !!searchString) {
            _products = await this.listProductsThatContainSpecificCharactersInTheName(searchString, email);
        }
        else if (!categories && !searchString) {
            _products = await this.listAllProducts(email);
        }

        if (!_products) {
            this.logger.error('There are no products.');
        }

        return _products as IProduct[];
    }

    private async listAllProducts(email: string): Promise<IProduct[] | null> {
        this.logger.info(`User '${email}' requesting list of all products.`)
        const _products = await this.storage.listAllProducts();
        if (!_products) {
            this.logger.error('There are no products.');
            throw new generalExceptions.DoesNotExistError('There are no products.');
        }

        return _products as IProduct[];
    }

    private async listAllProductsByCategory(categories: string[], email: string): Promise<IProduct[] | null> {
        this.logger.info(`User '${email}' requesting list of all products of specific categories.`)
        const _products = await this.storage.listAllProductsByCategory(categories);
        if (!_products) {
            this.logger.error('There are no products in this category.');
        }

        return _products as IProduct[];
    }

    private async listProductsThatContainSpecificCharactersInTheName(searchString: string, email: string): Promise<IProduct[] | null> {
        this.logger.info(`User '${email}' requesting list of products that contains the specified characters: '${searchString}', and their details.`)
        const _products = await this.storage.listProductsThatContainSpecificCharactersInTheName(searchString);
        if (!_products) {
            this.logger.error('There is no products with that characters.');
        }

        return _products as IProduct[];
    }

    async updateProduct(id: string, newProductData: IProduct, email: string): Promise<void> {
        if (!isObjectIdOrHexString(id)) throw new generalExceptions.InvalidFieldType("The type of field ID dont corresponding with type of ObjectId of Mongo.")
        let _product = await this.storage.findProductById(id);
        if (!_product) {
            this.logger.error('There is no product with that id.');
            throw new generalExceptions.DoesNotExistError('There is no product with that id.');
        }
        if (!!newProductData.category) {
            await this.categoryService.findCategoryByName(newProductData.category, email);
        }

        _product.price = !!newProductData.price ? newProductData.price : _product.price
        _product.name = !!newProductData.name ? newProductData.name : _product.name
        _product.category = !!newProductData.category ? newProductData.category : _product.category
        _product.description = !!newProductData.description ? newProductData.description : _product.description

        this.logger.info(`User '${email}' requesting update product with ID: ${id}.`)
        await this.storage.updateProduct(id, _product);

        return;
    }

    async deleteProduct(id: string, email: string): Promise<void> {
        if (!isObjectIdOrHexString(id)) throw new generalExceptions.InvalidFieldType("The type of field ID dont corresponding with type of ObjectId of Mongo.")
        let _product = await this.storage.findProductById(id);
        if (!_product) {
            this.logger.error('There is no product with that id.');
            throw new generalExceptions.DoesNotExistError('There is no product with that id.');
        }
        this.logger.info(`User '${email}' requesting delete product with ID: ${id}.`)
        await this.storage.deleteProduct(id);

        return;
    }
}