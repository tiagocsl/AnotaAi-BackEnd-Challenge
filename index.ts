// General Modules
import { Logger } from "tslog";
import http, { Server } from 'http';
import express, { Application } from 'express';
import swaggerUi from 'swagger-ui-express';
import morgan from 'morgan';
import cors from 'cors';
// Adapters
import MongoStorage from './src/adapters/storage/mongodb/storage';
import configureRouter from './src/adapters/http/rest/router';
import JWTAuthenticator from './src/adapters/authenticator/jwt/authenticator';
import BCryptCryptor from './src/adapters/cryptor/bcrypt/encryptor';
// Services
import UserService from './src/domain/user/service';
import CategoryService from "./src/domain/category/service";
import ProductService from "./src/domain/product/service";

import MongoInstace from './src/connectors/databases/mongoose';

const run = async (): Promise<void> => {
    const log: Logger = new Logger({ name: "AnotaAiLogger", displayFilePath: "hidden", displayLoggerName: false, displayFunctionName: false });
    const mongoInstance: MongoInstace = new MongoInstace(log);
    const authenticator: JWTAuthenticator = new JWTAuthenticator(process.env.JWT_SECRET as string);
    const cryptor: BCryptCryptor = new BCryptCryptor();

    await mongoInstance.connect();

    const storage: MongoStorage = new MongoStorage(log);

    const userService: UserService = new UserService(log, storage, authenticator, cryptor);
    const categoryService: CategoryService = new CategoryService(log, storage, userService);
    const productService: ProductService = new ProductService(log, storage, categoryService);

    const app: Application = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use(morgan('dev'));
    app.use(cors());

    app.get('/', ((req, res) => {
        res.status(200).json("Hello Word")
    }));

    app.use('/api', configureRouter(
        userService,
        categoryService,
        productService,
        authenticator
    ));

    const swaggerData = require(process.cwd() + '/swagger/swagger.json');
    app.use('/docs', swaggerUi.serve,
        swaggerUi.setup(swaggerData)
    )

    const server: Server = http.createServer(app);
    const port: number = parseInt(process.env.PORT || "") || 3005;

    server.listen(port, () => {
        log.info(`Server's running on port: ${port}`);
    });
}

run().catch(console.error);