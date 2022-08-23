import RoutesConfig from '../common/routes.config';
import authController from './auth.controller';
import authMiddleware from './middleware/auth.middleware';
import jwtMiddleware from './middleware/jwt.middleware';
import express from 'express';
import BodyValidationMiddleware from '../common/middleware/body.validation.middleware';
import { body } from 'express-validator';

class AuthRoutes extends RoutesConfig {
    constructor(app: express.Application) {
        super(app, 'AuthRoutes');
    }

    configureRoutes(): express.Application {
        this.app.post(`/auth`, [
            body('email').isEmail(),
            body('password').isString(),
            BodyValidationMiddleware.verifyBodyFieldsErrors,
            authMiddleware.verifyUserPassword,
            authController.createJWT,
        ]);

        this.app.post(`/auth/refresh-token`, [
            jwtMiddleware.validateJWT,
            jwtMiddleware.verifyRefreshBodyField,
            jwtMiddleware.validateRefresh,
            authController.createJWT,
        ]);
        
        return this.app;
    }
}

export default AuthRoutes;
