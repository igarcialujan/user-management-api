import { CredentialsError, ConflictError, FormatError, NotFoundError } from '../errors'
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken'
import { warn, error as _error } from '../utils/logger'

const handleError = (error, req, res, next) => {
    let status = 500

    if (error instanceof CredentialsError || error instanceof TokenExpiredError)
        status = 401
    else if (error instanceof TypeError || error instanceof FormatError || error instanceof JsonWebTokenError)
        status = 400
    else if (error instanceof NotFoundError)
        status = 404
    else if (error instanceof ConflictError)
        status = 409

    if (status < 500)
        warn(error.message)
    else
        _error(error.message)

    res.status(status).json({ error: error.message })
}

export default handleError