import { IRouter, Request, Response, Router } from "express";
import { checkSchema, Schema, validationResult } from "express-validator";
import HttpStatusCodes from 'http-status-codes';

import { ICategory } from '../../../domain/category/category';

import { ICategoryServicePort } from "../../../domain/category/port";
import { IAuthenticatorPort } from "../../../domain/user/port";

const createCategoryValidationSchema: Schema = {
  name: { isLength: { errorMessage: 'name field must contain at least 4 characters', options: { min: 4 } } },
  description: { isLength: { errorMessage: 'description field must contain at least 10 characters', options: { min: 10 } } }
}

export const createCategory = (service: ICategoryServicePort, authorization: IAuthenticatorPort) => async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(HttpStatusCodes.UNPROCESSABLE_ENTITY)
      .json({ errors: errors.array().map(({ param, msg }) => ({ field: param, message: msg })) })
  }
  try {
    const token = req.headers.authorization;
    const { id } = (await authorization.getUserTokenClaim(token as string));
    const category: object = await service.createCategory(req.body as ICategory, id);
    res.status(HttpStatusCodes.CREATED).json(category);
  } catch (err) {
    if ((err as any).message == "jwt malformed" || (err as any).message == "jwt expired") res.status(HttpStatusCodes.UNAUTHORIZED).json();
    else if ((err as any).data != undefined) res.status((err as any).statusCode).json({ error: (err as any).message });
    else res.status(HttpStatusCodes.BAD_REQUEST).json({ error: (err as Error).message });
  }
}

const categoryDetails = (service: ICategoryServicePort, authorization: IAuthenticatorPort) => async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) throw new Error("id field is required.")
    const token = req.headers.authorization;
    const { email } = (await authorization.getUserTokenClaim(token as string));
    const response: object = await service.findCategoryById(id, email);
    res.status(HttpStatusCodes.OK).json(response);
  } catch (err) {
    if ((err as any).message == "jwt malformed" || (err as any).message == "jwt expired") res.status(HttpStatusCodes.UNAUTHORIZED).json();
    else if ((err as any).data != undefined) res.status((err as any).statusCode).json({ error: (err as any).message });
    else res.status(HttpStatusCodes.BAD_REQUEST).json({ error: (err as Error).message });
  }
}

const listCategories = (service: ICategoryServicePort, authorization: IAuthenticatorPort) => async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization;
    const { email } = (await authorization.getUserTokenClaim(token as string));
    const { search_string } = req.query
    const response = await service.listCategories(search_string as string | undefined, email);
    res.status(HttpStatusCodes.OK).json(response);
  } catch (err) {
    if ((err as any).message == "jwt malformed" || (err as any).message == "jwt expired") res.status(HttpStatusCodes.UNAUTHORIZED).json();
    else if ((err as any).data != undefined) res.status((err as any).statusCode).json({ error: (err as any).message });
    else res.status(HttpStatusCodes.BAD_REQUEST).json({ error: (err as Error).message });
  }
}

export default function configureUserRouter(service: ICategoryServicePort, authorization: IAuthenticatorPort): IRouter {
  const router: IRouter = Router();

  router.post('', checkSchema(createCategoryValidationSchema), createCategory(service, authorization));
  router.get('', listCategories(service, authorization));
  router.get('/:id', categoryDetails(service, authorization));
  return router;
}