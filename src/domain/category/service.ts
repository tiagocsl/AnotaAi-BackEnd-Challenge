// General Modules Imports
import { Logger } from 'tslog';
import { isObjectIdOrHexString } from 'mongoose'
// Port Interfaces
import { ICategoryServicePort, ICategoryStoragePort } from './port';
import { IUserServicePort } from '../user/port';
// Entity Interface
import { ICategory } from './category'
import * as categoryExceptions from '../_exceptions/categoryExceptions';
import * as generalExceptions from '../_exceptions/generalExceptions';

export default class CategoryService implements ICategoryServicePort {
    constructor(
        private logger: Logger,
        private storage: ICategoryStoragePort,
        private userStorage: IUserServicePort
    ) { }

    async createCategory(category: ICategory, userId: string): Promise<ICategory> {
        const _user = await this.userStorage.findUserById(userId);
        if (_user?.role !== 'admin') {
            this.logger.fatal('This requester dont have permission to this service.');
            throw new categoryExceptions.InsufficientPermissionError('This requester dont have permission to this service.');
        }

        let _category: ICategory | null = await this.storage.findCategoryByName(category.name);
        if (_category) {
            this.logger.error('Category with the same information already exists.');
            throw new categoryExceptions.RepeatedDataError(`Category with the same information already exists.`);
        }
        const createdAtNormalized: Date = new Date();
        _category = await this.storage.persistCategory({ ...category, createdAt: createdAtNormalized });
        return _category as ICategory;
    }

    async findCategoryById(id: string, email: string): Promise<ICategory> {
        if (!isObjectIdOrHexString(id)) throw new generalExceptions.InvalidFieldType("The type of field ID dont corresponding with type of ObjectId of Mongo.")
        this.logger.info(`User '${email}' requesting details of category with ID: '${id}'.`)
        const _category = await this.storage.findCategoryById(id);
        if (!_category) {
            this.logger.error('There is no category with that id.');
            throw new generalExceptions.DoesNotExistError('There is no category with that id.');
        }

        return _category as ICategory;
    }

    async findCategoryByName(name: string, email: string): Promise<ICategory> {
        this.logger.info(`User '${email}' requesting details of a category '${name}'.`)
        const _category = await this.storage.findCategoryByName(name);
        if (!_category) {
            this.logger.error('There is no category with that name.');
            throw new generalExceptions.DoesNotExistError('There is no category with that name.');
        }

        return _category as ICategory;
    }

    async listCategories(searchString: string | undefined, email: string): Promise<ICategory[] | null> {
        let _categories: ICategory[] | null = []

        if (!!searchString) {
            _categories = await this.listCategoriesThatContainSpecificCharactersInTheName(searchString, email);
        }
        else if (!searchString) {
            _categories = await this.listAllCategories(email);
        }

        return _categories as ICategory[];
    }

    private async listAllCategories(email: string): Promise<ICategory[] | null> {
        this.logger.info(`User '${email}' requesting list of all categories.`)
        const _categories = await this.storage.listAllCategories();
        if (!_categories) {
            this.logger.error('There are no categories.');
            throw new generalExceptions.DoesNotExistError('There are no categories.');
        }

        return _categories as ICategory[];
    }

    private async listCategoriesThatContainSpecificCharactersInTheName(searchString: string, email: string): Promise<ICategory[] | null> {
        this.logger.info(`User '${email}' requesting list of categories that contains the specified characters: '${searchString}', and their details.`)
        const _categories = await this.storage.listCategoriesThatContainSpecificCharactersInTheName(searchString);
        if (!_categories) {
            this.logger.error('There is no categories with that characters.');
        }

        return _categories as ICategory[];
    }

}