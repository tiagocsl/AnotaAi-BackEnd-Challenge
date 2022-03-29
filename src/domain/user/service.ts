// General Modules Imports
import moment from 'moment';
import { Logger } from 'tslog';
// Port Interfaces
import { IAuthenticatorPort, ICryptorPort, IUserServicePort, IUserStoragePort } from './port';
// Entity Interface
import { IUser } from './user'

export default class UserService implements IUserServicePort {
    constructor(
        private logger: Logger,
        private storage: IUserStoragePort,
        private authenticator: IAuthenticatorPort,
        private cryptor: ICryptorPort
    ) { }

    async createUser(user: IUser, role: string): Promise<object> {
        const hasUserByEmail: IUser | null = await this.storage.findUserByEmail(user.email);
        if (hasUserByEmail) {
            this.logger.error('There is already a user record with the same email');
            throw new Error("There is already a user record with the same email");
        }

        const birthdateNormalized: Date = moment(user.birthdate, "YYYY-MM-DD").toDate();
        const createdAtNormalized: Date = new Date();
        const encryptedPassword: string = await this.cryptor.encrypt(user.password);
        const _user: IUser = await this.storage.persistUser({ ...user, password: encryptedPassword, birthdate: birthdateNormalized, role: role, createdAt: createdAtNormalized });

        const accessToken: string = await this.authenticator.generateToken({
            id: _user.id,
            firstName: _user.firstName,
            lastName: _user.lastName,
            email: _user.email,
            birthdate: _user.birthdate,
            createdAt: _user.createdAt
        });
        return { token: accessToken }
    }

    async authenticateUserByEmail(email: string, password: string): Promise<object> {
        const _user: IUser = await this.recognizeUserToAuthenticateByEmail(email, password);

        const accessToken: string = await this.authenticator.generateToken({
            id: _user.id,
            firstName: _user.firstName,
            lastName: _user.lastName,
            email: _user.email,
            birthdate: _user.birthdate,
            createdAt: _user.createdAt
        });

        return { token: accessToken };
    }

    async recognizeUserToAuthenticateByEmail(email: string, password: string): Promise<IUser> {
        const _user = await this.storage.findUserByEmail(email);
        if (!_user) throw new Error("User with this email does not exist")
        const isValid: boolean = await this.cryptor.compare(password, _user.password);
        if (!isValid) throw new Error("User not authorized");

        return _user;
    }

    async verifyUserAuthenticatedToken(token: string): Promise<void> {
        await this.authenticator.verifyToken(token);
    }

    async findUserById(id: string): Promise<IUser | null> {
        return await this.storage.findUserById(id);
    }
}