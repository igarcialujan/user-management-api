import * as dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import users from './routes/users.route'
import bodyParser from 'body-parser'
import connectDB from './db/connectDB'
import handleNotFound from './middleware/not-found-handler'
import handleError from './middleware/error-handler'
import cors from 'cors'
import logger from './users/utils/logger'

const { env: { PORT, MONGO_URI }, argv: [, , port = PORT || 8000] } = process

logger.info('starting server');

const app = express()

app.use(bodyParser.json())
app.use(cors())

app.get('/', (_req, res) => {
    res.json('Welcome to the User Management API')
})

app.use('/api/v1/users', users)

app.use(handleNotFound)
app.use(handleError)

(async () => {
    try {
        await connectDB(MONGO_URI || 'mongodb://127.0.0.1/users-api')
            
        app.listen(port, () => logger.info(`server up and listening on port ${port}...`))

        process.on('SIGINT', () => {
            logger.info('stopping server')

            process.exit(0)
        })
    } catch (error) {
        logger.error(error)
    }
})()