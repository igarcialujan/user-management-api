require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const cors = require('cors')
const logger = require('./api/utils/logger')
const { env: { PORT }, argv: [, , port = PORT || 8080] } = process

logger.info('starting server');

(async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1/users-api')
            
        const app = express()

        app.use(cors())

        const router = express.Router()

        const jsonBodyParser = bodyParser.json()

        app.get('/', (req, res) => {
            res.json('Welcome to Users Registration API')
        })

        api.post('/users', jsonBodyParser, registerUser)

        api.post('/users/auth', jsonBodyParser, authenticateUser)

        api.get('/users', retrieveUser)

        api.patch('/users', jsonBodyParser, modifyUser)

        api.delete('/users', jsonBodyParser, unregisterUser)

        api.all('*', (req, res) => {
            res.status(404).json({ message: 'sorry, this endpoint is not available' })
        })

        app.use('/api', api)

        app.listen(port, () => logger.info(`server up and listening on port ${port}...`))

        process.on('SIGINT', () => {
            logger.info('stopping server')

            process.exit(0)
        })
    } catch (error) {
        logger.error(error)
    }
})()