import { IUser } from "./user";

export interface IUserServicePort {
    createUser(user: IUser, role: string): Promise<object>;
    authenticateUserByEmail(email: string, password: string): Promise<object>;
    verifyUserAuthenticatedToken(token: string): Promise<void>;
    findUserById(id: string): Promise<IUser | null>;
}

export interface IUserStoragePort {
    persistUser(user: IUser): Promise<IUser>;
    findUserById(id: string): Promise<IUser | null>;
    findUserByEmail(email: string): Promise<IUser | null>;
}

export interface IAuthenticatorPort {
    generateToken(data: object): Promise<string>;
    verifyToken(token: string): Promise<void>;
    getUserTokenClaim(token: string): Promise<IUser>;
}

export interface ICryptorPort {
    encrypt(data: string): Promise<string>;
    compare(data: string, encrypted: string): Promise<boolean>;
}