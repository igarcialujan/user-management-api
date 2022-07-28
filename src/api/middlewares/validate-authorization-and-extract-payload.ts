import { verify } from 'jsonwebtoken'
const { env: { SECRET } } = process

function validateAuthorizationAndExtractPayload(authorization) {
    if (typeof authorization !== 'string') throw new TypeError('authorization is not a string')
    
    const [, token] = authorization.split(' ')

    const payload = verify(token, SECRET)

    return payload
}

export default validateAuthorizationAndExtractPayload