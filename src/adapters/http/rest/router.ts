import { IRouter, Router } from "express";

import { IAuthenticatorPort, IUserServicePort } from "../../../domain/user/port";
import { ICategoryServicePort } from "../../../domain/category/port";
import { IProductServicePort } from "../../../domain/product/port";

import configureUserRouter from "./user";
import configureCategoryRouter from "./category";
import configureProductRouter from "./product";

export default function configRouter(
    userService: IUserServicePort,
    categoryService: ICategoryServicePort,
    productService: IProductServicePort,
    authenticator: IAuthenticatorPort
): IRouter {
    const router: IRouter = Router();

    router.use("/users", configureUserRouter(userService));
    router.use("/categories", configureCategoryRouter(categoryService, authenticator));
    router.use("/products", configureProductRouter(productService, authenticator));

    return router;
}