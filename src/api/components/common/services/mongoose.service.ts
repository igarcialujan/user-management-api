import mongoose from 'mongoose';
import debug from 'debug';
import { env } from '../../../../config/globals'

const log: debug.IDebugger = debug('app:mongoose-service');

class MongooseService {
    private count = 0;

    constructor() {
        this.connectWithRetry();
    }

    getMongoose() {
        return mongoose;
    }

    connectWithRetry = () => {
        log('Attempting MongoDB connection (will retry if needed)');

        const MONGO_URI = env.MONGO_URI as string;

        mongoose
            .connect(MONGO_URI)
            .then(() => {
                log('MongoDB is connected');
            })
            .catch((err) => {
                const retrySeconds = 5;

                log(
                    `MongoDB connection unsuccessful (will retry #${++this
                        .count} after ${retrySeconds} seconds):`,
                    err
                );
                
                setTimeout(this.connectWithRetry, retrySeconds * 1000);
            });
    };
}
export default new MongooseService();