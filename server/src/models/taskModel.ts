import mongoose, { Document, Model } from 'mongoose'

export type TaskStatus = 'pending' | 'in_progress' | 'completed'

export interface TaskDocument extends Document {
    title: string
    description: string
    completed: boolean
    createBy: mongoose.Types.ObjectId
    date: Date
    dueDate?: Date
    status: TaskStatus
    order: number
}

export const taskSchema = new mongoose.Schema<TaskDocument>({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    completed: {
        type: Boolean,
        default: false,
    },
    createBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    dueDate: {
        type: Date,
        required: false,
    },
    status: {
        type: String,
        enum: ['pending', 'in_progress', 'completed'],
        default: 'pending',
    },
    order: {
        type: Number,
        default: 0,
    },
})

export const Task: Model<TaskDocument> = mongoose.model<TaskDocument>(
    'Task',
    taskSchema
)
