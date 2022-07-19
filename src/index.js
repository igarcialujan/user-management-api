require('dotenv').config()
const express = require('express')
const app = express()
const users = require('./routes/users.route')
// const bodyParser = require('body-parser')
const connectDB = require('./db/connectDB')
const handleNotFound = require('./middleware/not-found-handler')
const handleError = require('./middleware/error-handler')
const cors = require('cors')
const logger = require('./api/utils/logger')

const { env: { PORT, MONGO_URI }, argv: [, , port = PORT || 8080] } = process

logger.info('starting server');

app.use(express.json())
app.use(cors())

app.use('/api/v1/users', users)

app.use(handleNotFound)
app.use(handleError)

app.get('/', (req, res) => {
    res.json('Welcome to the User Management API')
})

(async () => {
    try {
        await connectDB(MONGO_URI || 'mongodb://127.0.0.1/users-api')
            
        // const jsonBodyParser = bodyParser.json()

        // api.all('*', (req, res) => {
        //     res.status(404).json({ message: 'Sorry, this endpoint is not available' })
        // })

        app.listen(port, () => logger.info(`server up and listening on port ${port}...`))

        process.on('SIGINT', () => {
            logger.info('stopping server')

            process.exit(0)
        })
    } catch (error) {
        logger.error(error)
    }
})()