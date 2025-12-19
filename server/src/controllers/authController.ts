import { Response } from 'express'
import bcrypt from 'bcrypt'
import { User } from '../models/userModel.js'
import { generateToken } from '../utils/token.js'
import {
    uploadAvatarToSupabase,
    deleteAvatarFromSupabase,
} from '../storage/supabase.storage.js'
import { CustomRequest } from '../types/index.js'

export const register = async (req: CustomRequest, res: Response) => {
    try {
        const { username, email, password: pass, role } = req.body

        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(pass, salt)

        const user = await User.create({
            username,
            email,
            password: hash,
            role,
        })

        const userData = user.toObject()
        delete (userData as any).password

        const token = generateToken(user._id.toString())

        return res.status(201).json({ user: userData, token })
    } catch (err: unknown) {
        console.error(err)
        return res.status(500).json({ message: (err as Error).message })
    }
}

export const login = async (req: CustomRequest, res: Response) => {
    try {
        const { email, password: pass } = req.body

        const user = await User.findOne({ email })

        if (!user) {
            return res.status(404).json({
                message: 'User not found',
            })
        }

        const isValid = await bcrypt.compare(pass, user.password!)

        if (!isValid) {
            return res.status(404).json({
                message: 'Invalid password or email',
            })
        }

        const userData = user.toObject()
        delete (userData as any).password

        const token = generateToken(user._id.toString())

        return res.status(200).json({ user: userData, token })
    } catch (err: unknown) {
        console.error('Something wrong', err)
        return res.status(500).json({ message: (err as Error).message })
    }
}

export const updateProfile = async (req: CustomRequest, res: Response) => {
    try {
        const userId = req.user!._id
        const { username, firstName, lastName } = req.body

        if (!username) {
            return res.status(400).json({ message: 'Username is required' })
        }

        const updateData: any = { username }

        if (firstName !== undefined) {
            updateData.firstName = firstName
        }
        if (lastName !== undefined) {
            updateData.lastName = lastName
        }

        const currentUser = await User.findById(userId)
        if (!currentUser) {
            return res.status(404).json({ message: 'User not found' })
        }

        if (req.file) {
            try {
                if (currentUser.avatarKey) {
                    await deleteAvatarFromSupabase(currentUser.avatarKey)
                }

                const { url, key } = await uploadAvatarToSupabase(
                    req.file,
                    userId.toString()
                )
                updateData.avatar = url
                updateData.avatarKey = key
            } catch (uploadError: unknown) {
                console.error(
                    'Error uploading avatar to Supabase:',
                    uploadError
                )
                return res.status(500).json({
                    message: `Failed to upload avatar: ${(uploadError as Error).message}`,
                })
            }
        }

        const user = await User.findByIdAndUpdate(userId, updateData, {
            new: true,
        })

        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }

        const userData = user.toObject()
        delete (userData as any).password
        return res.status(200).json({ user: userData })
    } catch (err: unknown) {
        console.error(err)
        return res.status(500).json({ message: 'Failed to update profile' })
    }
}

export const updatePassword = async (req: CustomRequest, res: Response) => {
    try {
        const userId = req.user!._id
        const { currentPassword, newPassword } = req.body

        const user = await User.findById(userId)

        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }

        const isValid = await bcrypt.compare(currentPassword, user.password!)

        if (!isValid) {
            return res.status(400).json({ message: 'Invalid current password' })
        }

        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(newPassword, salt)

        user.password = hash
        await user.save()

        return res
            .status(200)
            .json({ message: 'Password updated successfully' })
    } catch (err: unknown) {
        console.error(err)
        return res.status(500).json({ message: 'Failed to update password' })
    }
}

export const getAllUsers = async (req: CustomRequest, res: Response) => {
    try {
        if (req.user!.role !== 'admin') {
            return res
                .status(403)
                .json({ message: 'Access denied. Admin only.' })
        }

        const users = await User.find({}, '-password')

        return res.status(200).json({ users })
    } catch (err: unknown) {
        console.error(err)
        return res.status(500).json({ message: 'Failed to fetch users' })
    }
}

export const getUserById = async (req: CustomRequest, res: Response) => {
    try {
        if (req.user!.role !== 'admin') {
            return res
                .status(403)
                .json({ message: 'Access denied. Admin only.' })
        }

        const user = await User.findById(req.params.id, '-password')

        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }

        return res.status(200).json({ user })
    } catch (err: unknown) {
        console.error(err)
        return res.status(500).json({ message: 'Failed to fetch user' })
    }
}

export const deleteUser = async (req: CustomRequest, res: Response) => {
    try {
        if (req.user!.role !== 'admin') {
            return res
                .status(403)
                .json({ message: 'Access denied. Admin only.' })
        }

        const userId = req.params.id

        if (userId === req.user!._id.toString()) {
            return res
                .status(400)
                .json({ message: 'Cannot delete your own account' })
        }

        const user = await User.findByIdAndDelete(userId)

        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }

        return res.status(200).json({ message: 'User deleted successfully' })
    } catch (err: unknown) {
        console.error(err)
        return res.status(500).json({ message: 'Failed to delete user' })
    }
}
