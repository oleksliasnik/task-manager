import express from 'express'
import * as authController from '../controllers/authController.js'
import checkAuth from '../middlewares/checkAuth.js'
import { upload } from '../middlewares/upload.js'

const router = express.Router()

router.post('/auth/register', authController.register)
router.post('/auth/login', authController.login)
router.put(
    '/auth/profile',
    checkAuth,
    upload.single('avatar'),
    authController.updateProfile
)
router.put('/auth/password', checkAuth, authController.updatePassword)
router.get('/users', checkAuth, authController.getAllUsers)
router.get('/users/:id', checkAuth, authController.getUserById)
router.delete('/users/:id', checkAuth, authController.deleteUser)

export default router
