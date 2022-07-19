const express = require('express')
const router = express.Router()
const { 
    registerUser, 
    logInUser, 
    retrieveUser, 
    updateUserProfile,
    unregisterUser
} = require('../controllers/users.controller')

router.route('/')
    .get(retrieveUser)
    .post(registerUser)
    .patch(updateUserProfile)
    .delete(unregisterUser)

router.route('/auth')
    .post(logInUser)

module.exports = router