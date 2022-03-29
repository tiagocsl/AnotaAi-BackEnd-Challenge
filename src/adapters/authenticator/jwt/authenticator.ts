import jwt, { JwtPayload } from 'jsonwebtoken';

import { IUser } from '../../../domain/user/user';
import { IAuthenticatorPort } from "../../../domain/user/port";

export default class JWTAuthenticator implements IAuthenticatorPort {
  constructor(
    private readonly secret: string
  ) { }

  async generateToken(data: IUser): Promise<string> {
    const token: string = jwt.sign(data as Object, this.secret, { expiresIn: '8h' });
    return token;
  }

  async verifyToken(token: string): Promise<void> {
    jwt.verify(token, this.secret);
  }

  async getUserTokenClaim(token: string): Promise<IUser> {
    const parsedToken = token.split(' ');
    if (parsedToken[0] !== 'Bearer') throw new Error("Invalid Authorization Header value. Please make sure the token have Bearer prefix.")
    const decoded: JwtPayload = jwt.verify(parsedToken[1], this.secret) as JwtPayload;
    return (decoded as IUser);
  }

  async getUserId(token: string): Promise<number> {
    const decoded: JwtPayload = jwt.verify(token, this.secret) as JwtPayload;
    const user: IUser = (decoded as IUser);
    return user.id;
  }
}