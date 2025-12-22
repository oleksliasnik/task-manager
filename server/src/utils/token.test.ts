import { describe, it, expect } from 'vitest'
import { generateToken, verifyToken } from './token.js'
import jwt from 'jsonwebtoken'

// Mock environment variables
process.env.JWT_SECRET = 'test-secret'

describe('Token Utilities', () => {
    const userId = 'user123'

    it('should generate a valid JWT token', () => {
        const token = generateToken(userId)
        expect(typeof token).toBe('string')

        const decoded = jwt.verify(token, 'test-secret') as { _id: string }
        expect(decoded._id).toBe(userId)
    })

    it('should verify a valid token correctly', () => {
        const token = jwt.sign({ _id: userId }, 'test-secret')
        const verified = verifyToken(token) as { _id: string }

        expect(verified._id).toBe(userId)
    })

    it('should throw an error for an invalid token', () => {
        expect(() => verifyToken('invalid-token')).toThrow()
    })

    it('should throw an error for an expired token', () => {
        const expiredToken = jwt.sign({ _id: userId }, 'test-secret', {
            expiresIn: '-1s',
        })
        expect(() => verifyToken(expiredToken)).toThrow()
    })
})
