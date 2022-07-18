const express = require('express')
const router = express.Router()
const { 
    registerUser, 
    authenticateUser, 
    retrieveUser, 
    modifyUser,
    unregisterUser
} = require('./controllers')

router.route('/users')
    .get(retrieveUser)
    .post(registerUser)
    .patch(modifyUser)
    .delete(unregisterUser)

router.route('/users/auth')
    .post(authenticateUser)

module.exports = router