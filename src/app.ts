// required external modules
import express from 'express';
import * as http from 'http';
import cors from 'cors';
import RoutesConfig from './api/components/common/routes.config';
import UsersRoutes from './api/components/users/users.routes.config';
import AuthRoutes from './api/components/auth/auth.routes.config';
import debug from 'debug';
import helmet from 'helmet';
import logger from './config/logger';
import { env } from './config/globals'

// app variables
const app: express.Application = express();
const server: http.Server = http.createServer(app);
const port = env.PORT;
const routes: Array<RoutesConfig> = [];
const debugLog: debug.IDebugger = debug('app');

// app configuration
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(logger);

// routes definitions
routes.push(new UsersRoutes(app));
routes.push(new AuthRoutes(app));

app.get('/', (req: express.Request, res: express.Response) => {
    res.status(200).send(`Server up and running at http://localhost:${port}`);
});

// server activation
export default server.listen(port, () => {
    routes.forEach((route: RoutesConfig) => {
        debugLog(`Routes configured for ${route.getName()}`);
    });
    
    console.log(`Server up and running at http://localhost:${port}`);
});