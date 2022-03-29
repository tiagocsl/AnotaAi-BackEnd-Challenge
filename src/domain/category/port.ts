import { ICategory } from "./category";

export interface ICategoryServicePort {
    createCategory(category: ICategory, role: string): Promise<ICategory>;
    findCategoryByName(name: string, email: string): Promise<ICategory>;
    findCategoryById(id: string, email: string): Promise<ICategory>;
    listCategories(searchString: string | undefined, email: string): Promise<ICategory[] | null>;
}

export interface ICategoryStoragePort {
    persistCategory(category: ICategory): Promise<ICategory>;
    findCategoryById(id: string): Promise<ICategory | null>;
    findCategoryByName(name: string): Promise<ICategory | null>;
    listAllCategories(): Promise<ICategory[] | null>;
    listCategoriesThatContainSpecificCharactersInTheName(searchString: string): Promise<ICategory[] | null>;
}