const { createUser, authenticateUser, getUser, updateUser, deleteUser } = require('../services/users.service')
const { handleError, validateAuthorizationAndExtractPayload } = require('../middlewares')
const { validateName, validateUsername, validateEmail, validatePassword, validateData, validateId } = require('../validations/users.validation')
const jwt = require('jsonwebtoken')
const { env: { SECRET } } = process

const registerUser = async (req, res) => {
    const { body: { name, username, email, password } } = req 

    try {
        validateName(name)
        validateUsername(username)
        validateEmail(email)
        validatePassword(password)

        await createUser(name, username, email, password)
        
        res.status(201).send()
    } catch (error) {
        handleError(error, res)
    }
}

const logInUser = async (req, res) => {
    const { body: { username, password } } = req 

    try { 
        validateUsername(username)
        validatePassword(password)
        
        const id = await authenticateUser(username, password)

        const token = jwt.sign({ sub: id, exp: Math.floor(Date.now() / 1000) + 36000 }, SECRET )

        res.json({ token })
    } catch (error) {
        handleError(error, res)
    }
}

const retrieveUser = async (req, res) => {
    const { headers: { authorization } } = req 

    try {
        const { sub: id } = validateAuthorizationAndExtractPayload(authorization)

        validateId(id)

        const user = await getUser(id)

        res.json(user)
    } catch (error) {
        handleError(error, res)
    }
}

const updateUserProfile = async (req, res) => {
    const { headers: { authorization }, body: data } = req 

    try {
        const { sub: id } = validateAuthorizationAndExtractPayload(authorization)

        validateId(id)
        validateData(data)

        await updateUser(id, data)
        
        res.status(204).send() 
    } catch (error) {
        handleError(error, res)
    }
}

const unregisterUser = async (req, res) => {
    const { headers: { authorization }, body: { password } } = req 

    try {
        const { sub: id } = validateAuthorizationAndExtractPayload(authorization)

        validateId(id)
        validatePassword(password)

        await deleteUser(id, password)
        
        res.status(204).send()
    } catch (error) {
        handleError(error, res)
    }
}

module.exports = {
    registerUser,
    logInUser,
    retrieveUser,
    updateUserProfile,
    unregisterUser
}