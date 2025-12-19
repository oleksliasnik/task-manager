import { Response } from 'express'
import { Task } from '../models/taskModel.js'
import { CustomRequest } from '../types/index.js'

export const createTask = async (req: CustomRequest, res: Response) => {
    try {
        let { title, description, dueDate } = req.body
        const userId = req.user!._id

        if (!title || title.trim() === '') {
            const now = new Date()
            const dateStr = now.toLocaleDateString('uk-UA', {
                day: '2-digit',
                month: '2-digit',
                year: '2-digit',
            })
            const timeStr = now.toLocaleTimeString('uk-UA', {
                hour: '2-digit',
                minute: '2-digit',
            })
            title = `Task ${dateStr} ${timeStr}`
        }

        const maxOrderTask = await Task.findOne({ createBy: userId }).sort({
            order: -1,
        })
        const newOrder = maxOrderTask ? maxOrderTask.order + 1000 : 1000

        const taskObj = {
            title,
            description,
            createBy: userId as any,
            dueDate,
            order: newOrder,
        }

        const task = await Task.create(taskObj)

        return res.status(201).json(task)
    } catch (err: unknown) {
        console.error('Error creating task:', err)
        return res.status(400).json({
            message: 'Failed to create task',
            error: (err as Error).message,
        })
    }
}

export const updateTask = async (req: CustomRequest, res: Response) => {
    try {
        const taskId = req.params.id
        const userId = req.user!._id

        const task = await Task.findOneAndUpdate(
            { _id: taskId, createBy: userId },
            req.body,
            {
                new: true,
                runValidators: true,
            }
        )

        if (!task) {
            return res.status(404).json({ message: 'Task not found' })
        }

        return res.status(200).json(task)
    } catch (err: unknown) {
        console.error(err)
        res.status(400).json({
            message: 'Failed to update the task',
            error: (err as Error).message,
        })
    }
}

export const deleteTask = async (req: CustomRequest, res: Response) => {
    try {
        const taskId = req.params.id
        const userId = req.user!._id

        const task = await Task.findOneAndDelete({
            _id: taskId,
            createBy: userId,
        })

        if (!task) {
            return res.status(404).json({ message: 'Task not found' })
        }

        return res.status(200).json({ message: 'Task deleted successfully' })
    } catch (err: unknown) {
        console.error(err)
        res.status(400).json({ message: 'Failed to delete the task' })
    }
}

export const getTasksByUserId = async (req: CustomRequest, res: Response) => {
    try {
        const userId = req.user!._id
        const sortQuery = req.query.sort as string | undefined
        let sortOption: Record<string, number> = {}

        if (sortQuery === 'manual') {
            sortOption = { order: 1 }
        } else {
            const sortOrder = sortQuery === 'desc' ? -1 : 1
            sortOption = { date: sortOrder }
        }

        const tasks = await Task.find({
            createBy: userId,
        }).sort(sortOption as any)

        return res.status(200).json(tasks)
    } catch (err: unknown) {
        console.error(err)
        res.status(400).json({ message: 'Failed to get the tasks' })
    }
}

export const getTask = async (req: CustomRequest, res: Response) => {
    try {
        const taskId = req.params.id
        const userId = req.user!._id

        const task = await Task.findOne({
            _id: taskId,
            createBy: userId,
        })

        if (!task) {
            return res.status(404).json({ message: 'Task not found' })
        }

        return res.status(200).json(task)
    } catch (err: unknown) {
        console.error(err)
        res.status(400).json({
            message: 'Failed to find task',
            error: (err as Error).message,
        })
    }
}

export const getAllTasks = async (req: CustomRequest, res: Response) => {
    try {
        const sortOrder = req.query.sort === 'desc' ? -1 : 1
        const tasks = await Task.find().sort({ date: sortOrder } as any)

        return res.status(200).json(tasks)
    } catch (err: unknown) {
        console.error(err)
        res.status(400).json({
            message: 'Failed to find all tasks',
            error: (err as Error).message,
        })
    }
}

export const reorderTasks = async (req: CustomRequest, res: Response) => {
    try {
        const { tasks } = req.body as {
            tasks: { _id: string; order: number }[]
        }
        const userId = req.user!._id

        if (!tasks || !Array.isArray(tasks)) {
            return res.status(400).json({ message: 'Invalid tasks data' })
        }

        const updates = tasks.map((task) => {
            return Task.updateOne(
                { _id: task._id, createBy: userId },
                { $set: { order: task.order } }
            )
        })

        await Promise.all(updates)

        return res.status(200).json({ message: 'Tasks reordered successfully' })
    } catch (err: unknown) {
        console.error(err)
        res.status(400).json({
            message: 'Failed to reorder tasks',
            error: (err as Error).message,
        })
    }
}
