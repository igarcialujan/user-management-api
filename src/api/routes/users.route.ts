import { Router } from 'express'
const router = Router()
import { registerUser, logInUser, retrieveUser, updateUserProfile, unregisterUser } from '../controllers/users.controller'

router.route('/')
    .get(retrieveUser)
    .post(registerUser)
    .patch(updateUserProfile)
    .delete(unregisterUser)

router.route('/auth')
    .post(logInUser)

export default router