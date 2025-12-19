import mongoose, { Document, Model } from 'mongoose'

export type UserRole = 'user' | 'admin'

export interface UserDocument extends Document {
    username: string
    email: string
    password?: string
    role: UserRole
    avatar: string
    avatarKey: string
    firstName: string
    lastName: string
}

export const userSchema = new mongoose.Schema<UserDocument>({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: false,
    },
    role: {
        type: String,
        default: 'user',
    },
    avatar: {
        type: String,
        default: '',
    },
    avatarKey: {
        type: String,
        default: '',
    },
    firstName: {
        type: String,
        default: '',
    },
    lastName: {
        type: String,
        default: '',
    },
})

export const User: Model<UserDocument> = mongoose.model<UserDocument>(
    'User',
    userSchema
)
