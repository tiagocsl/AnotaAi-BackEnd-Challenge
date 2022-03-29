import { Logger } from "tslog";
import mongoose from "mongoose";

export default class MongoInstace {
    constructor(private logger: Logger) { }
    database: typeof mongoose;

    async connect(): Promise<void> {
        const uri: string = process.env.DATABASE_URL as string;
        this.logger.debug(`URI_VALUE: ${uri}`);

        this.logger.info(`Trying to connect to ${(uri as any).split('/').pop().split('?')[0]} database`);
        this.database = await mongoose.connect(uri);
        mongoose.Promise = global.Promise;

        this.database.connection.on('connecting', () => {
            console.log('\x1b[32m', 'MongoDB :: connecting');
        });

        this.database.connection.on('connected', () => {
            console.log('\x1b[32m', 'MongoDB :: connected');
        });

        this.database.connection.once("open", async () => {
            this.logger.info(`Connected to ${(uri as any).split('/').pop().split('?')[0]} database`);
        });

        this.database.connection.on("error", () => {
            this.logger.fatal(`Unable to establish connection to ${(uri as any).split('/').pop().split('?')[0]} database.`);
        });
    }

    disconnect() {
        mongoose.connection.close();
        this.logger.info(`Disconnected from database`);
    }
}