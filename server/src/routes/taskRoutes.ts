import express from 'express'
import checkAuth from '../middlewares/checkAuth.js'
import * as taskController from '../controllers/taskController.js'
import checkAdmin from '../middlewares/checkAdmin.js'

const router = express.Router()

router.use(checkAuth)

router.post('/task', taskController.createTask)
router.get('/task', taskController.getTasksByUserId)
router.put('/task/reorder', taskController.reorderTasks)
router.get('/task/all', checkAdmin, taskController.getAllTasks)
router.get('/task/:id', taskController.getTask)
router.put('/task/:id', taskController.updateTask)
router.delete('/task/:id', taskController.deleteTask)

export default router
