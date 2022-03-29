import { IProduct } from "./product";

export interface IProductServicePort {
    createProduct(product: IProduct, email: string): Promise<IProduct | undefined>;
    findProductById(id: string, email: string): Promise<IProduct | null>;
    listProducts(categories: string | undefined, searchString: string | undefined, email: string): Promise<IProduct[] | null>;
    updateProduct(id: string, newProductData: IProduct, email: string): Promise<void>;
    deleteProduct(id: string, email: string): Promise<void>;
}

export interface IProductStoragePort {
    persistProduct(product: IProduct): Promise<IProduct>;
    findProductById(id: string): Promise<IProduct | null>;
    listAllProducts(): Promise<IProduct[] | null>;
    listAllProductsByCategory(categories: string[]): Promise<IProduct[] | null>;
    listProductsThatContainSpecificCharactersInTheName(searchString: string): Promise<IProduct[] | null>;
    updateProduct(id: string, newProductData: IProduct): Promise<any>;
    deleteProduct(id: string): Promise<any>;
}