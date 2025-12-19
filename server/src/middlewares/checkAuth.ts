import { Response, NextFunction } from 'express'
import { User } from '../models/userModel.js'
import { verifyToken } from '../utils/token.js'
import { CustomRequest } from '../types/index.js'

export default async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        if (
            !req.headers.authorization ||
            !req.headers.authorization.startsWith('Bearer ')
        ) {
            return res.status(401).json({ message: 'Not authorized, no token' })
        }

        const token = req.headers.authorization.split(' ')[1]
        const decoded = verifyToken(token) as { _id: string }

        const user = await User.findById(decoded._id).select('-password')

        if (!user) {
            return res
                .status(401)
                .json({ message: 'Not authorized, user not found' })
        }

        req.user = user.toObject()
        next()
    } catch (error) {
        console.error(error)
        res.status(401).json({ message: 'Not authorized, token failed' })
    }
}
