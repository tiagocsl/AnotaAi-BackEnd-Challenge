import { IRouter, Request, Response, Router } from "express";
import { checkSchema, Schema, validationResult } from "express-validator";
import HttpStatusCodes from 'http-status-codes';

import { IUser } from '../../../domain/user/user';

import { IUserServicePort } from "../../../domain/user/port";

const createUserValidationSchema: Schema = {
  firstName: { isLength: { errorMessage: 'firstName field must contain at least 3 characters', options: { min: 3 } } },
  lastName: { isLength: { errorMessage: 'lastName field must contain at least 3 characters', options: { min: 3 } } },
  password: { isLength: { errorMessage: 'password field must contain at least 6 characters', options: { min: 6 } } },
  email: { isEmail: { errorMessage: 'email invalid' } }
}

const createAdminUserValidationSchema: Schema = {
  firstName: { isLength: { errorMessage: 'firstName field must contain at least 3 characters', options: { min: 3 } } },
  lastName: { isLength: { errorMessage: 'lastName field must contain at least 3 characters', options: { min: 3 } } },
  password: {
    isStrongPassword: {
      options: {
        minLength: 8,
        minUppercase: 1,
        minLowercase: 1,
        minNumbers: 2,
        minSymbols: 1
      },
      errorMessage: {
        minLength: "password must be at least 8 digits",
        minUppercase: "password must be at least 1 uppercase letter",
        minLowercase: "password must be at least 1 lowercase letter",
        minNumbers: "password must be at least 2 numbers",
        minSymbols: "password must be at least 1 Symbols"
      }
    }
  },
  email: { isEmail: { errorMessage: 'invalid provider' } }
}

export const createUser = (service: IUserServicePort) => async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(HttpStatusCodes.UNPROCESSABLE_ENTITY)
      .json({ errors: errors.array().map(({ param, msg }) => ({ field: param, message: msg })) })
  }
  try {
    const accessToken: object = await service.createUser(req.body as IUser, "user");
    res.status(HttpStatusCodes.CREATED).json(accessToken);
  } catch (err) {
    res.status(HttpStatusCodes.BAD_REQUEST).json({ error: (err as Error).message });
  }
}

export const createAdmin = (service: IUserServicePort) => async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(HttpStatusCodes.UNPROCESSABLE_ENTITY)
      .json({ errors: errors.array().map(({ param, msg }) => ({ field: param, message: msg })) })
  }
  try {
    let email = req.body.email.split('@').pop();
    if (email !== 'anotaai.com') throw new Error("Invalid email provider.");
    const accessToken: object = await service.createUser(req.body as IUser, "admin");
    res.status(HttpStatusCodes.CREATED).json(accessToken);
  } catch (err) {
    res.status(HttpStatusCodes.BAD_REQUEST).json({ error: (err as Error).message });
  }
}

export const authenticateUser = (service: IUserServicePort) => async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const token: object = await service.authenticateUserByEmail(email, password);
    res.status(HttpStatusCodes.OK).json(token);
  } catch (err) {
    res.status(HttpStatusCodes.UNAUTHORIZED).json({ error: (err as Error).message });
  }
}

export default function configureUserRouter(service: IUserServicePort): IRouter {
  const router: IRouter = Router();

  router.post('/', checkSchema(createUserValidationSchema), createUser(service));
  router.post('/admin', checkSchema(createAdminUserValidationSchema), createAdmin(service));
  router.post('/authenticate', authenticateUser(service));
  return router;
}