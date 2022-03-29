import { IRouter, Request, Response, Router } from "express";
import { checkSchema, Schema, validationResult } from "express-validator";
import HttpStatusCodes from 'http-status-codes';

import { IProduct } from '../../../domain/product/product';

import { IProductServicePort } from "../../../domain/product/port";
import { IAuthenticatorPort } from "../../../domain/user/port";

const createCategoryValidationSchema: Schema = {
  name: { isLength: { errorMessage: 'name field must contain at least 4 characters', options: { min: 4 } } },
  description: { isLength: { errorMessage: 'description field must contain at least 4 characters', options: { min: 10 } } },
  price: { isNumeric: { errorMessage: 'price field must be a number type' } },
  category: { isString: { errorMessage: 'category field must be a string type' }, isLength: { errorMessage: 'category field must contain at least 4 characters', options: { min: 4 } } },
}

const createProduct = (service: IProductServicePort, authorization: IAuthenticatorPort) => async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(HttpStatusCodes.UNPROCESSABLE_ENTITY)
      .json({ errors: errors.array().map(({ param, msg }) => ({ field: param, message: msg })) })
  }
  try {
    const token = req.headers.authorization;
    const { email } = (await authorization.getUserTokenClaim(token as string));
    const product = await service.createProduct(req.body as IProduct, email);
    res.status(HttpStatusCodes.CREATED).json(product);
  } catch (err) {
    res.status(HttpStatusCodes.BAD_REQUEST).json({ error: (err as Error).message });
  }
}

const productDetailsById = (service: IProductServicePort, authorization: IAuthenticatorPort) => async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) throw new Error("id field is required.")
    const token = req.headers.authorization;
    const { email } = (await authorization.getUserTokenClaim(token as string));
    const response = await service.findProductById(id, email);
    res.status(HttpStatusCodes.OK).json(response);
  } catch (err) {
    if ((err as any).message == "jwt malformed" || (err as any).message == "jwt expired") res.status(HttpStatusCodes.UNAUTHORIZED).json();
    else if ((err as any).data != undefined) res.status((err as any).statusCode).json({ error: (err as any).message });
    else res.status(HttpStatusCodes.BAD_REQUEST).json({ error: (err as Error).message });
  }
}

const listProducts = (service: IProductServicePort, authorization: IAuthenticatorPort) => async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization;
    const { email } = (await authorization.getUserTokenClaim(token as string));
    const { category, search_string } = req.query
    const response = await service.listProducts(category as string | undefined, search_string as string | undefined, email);
    res.status(HttpStatusCodes.OK).json(response);
  } catch (err) {
    if ((err as any).message == "jwt malformed" || (err as any).message == "jwt expired") res.status(HttpStatusCodes.UNAUTHORIZED).json();
    else if ((err as any).data != undefined) res.status((err as any).statusCode).json({ error: (err as any).message });
    else res.status(HttpStatusCodes.BAD_REQUEST).json({ error: (err as Error).message });
  }
}

const updateProduct = (service: IProductServicePort, authorization: IAuthenticatorPort) => async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization;
    const { email } = (await authorization.getUserTokenClaim(token as string));
    const { id } = req.params;
    const newProductData = req.body;
    const response = await service.updateProduct(id, newProductData, email);
    res.status(HttpStatusCodes.NO_CONTENT).json(response);
  } catch (err) {
    if ((err as any).message == "jwt malformed" || (err as any).message == "jwt expired") res.status(HttpStatusCodes.UNAUTHORIZED).json();
    else if ((err as any).data != undefined) res.status((err as any).statusCode).json({ error: (err as any).message });
    else res.status(HttpStatusCodes.BAD_REQUEST).json({ error: (err as Error).message });
  }
}

const deleteProduct = (service: IProductServicePort, authorization: IAuthenticatorPort) => async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization;
    const { email } = (await authorization.getUserTokenClaim(token as string));
    const { id } = req.params;
    const response = await service.deleteProduct(id, email);
    res.status(HttpStatusCodes.NO_CONTENT).json(response);
  } catch (err) {
    if ((err as any).message == "jwt malformed" || (err as any).message == "jwt expired") res.status(HttpStatusCodes.UNAUTHORIZED).json();
    else if ((err as any).data != undefined) res.status((err as any).statusCode).json({ error: (err as any).message });
    else res.status(HttpStatusCodes.BAD_REQUEST).json({ error: (err as Error).message });
  }
}

export default function configureUserRouter(service: IProductServicePort, authorization: IAuthenticatorPort): IRouter {
  const router: IRouter = Router();

  router.post('', checkSchema(createCategoryValidationSchema), createProduct(service, authorization));
  router.get('', listProducts(service, authorization));
  router.get('/:id', productDetailsById(service, authorization));
  router.put('/:id', updateProduct(service, authorization));
  router.delete('/:id', deleteProduct(service, authorization));

  return router;
}