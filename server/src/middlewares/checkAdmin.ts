import { Response, NextFunction } from 'express'
import { CustomRequest } from '../types/index.js'

export default async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.user) {
            return res.status(404).send({ message: 'User not found' })
        }

        if (req.user.role !== 'admin') {
            return res.status(500).json({
                message: 'Access denied',
            })
        }

        next()
    } catch (err: unknown) {
        console.error(err)
        return res.status(500).json({ message: (err as Error).message })
    }
}
