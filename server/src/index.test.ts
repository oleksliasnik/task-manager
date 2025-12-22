import { describe, it, expect } from 'vitest'
import request from 'supertest'

// Mock environment variables for CI/Tests
process.env.JWT_SECRET = 'test-secret'
process.env.SUPABASE_URL = 'https://mock.supabase.co'
process.env.SUPABASE_KEY = 'mock-key'

import { app } from './index.js'

describe('Server Health Check', () => {
    it('should return 200 OK and status ok', async () => {
        const response = await request(app).get('/api/health')

        expect(response.status).toBe(200)
        expect(response.body).toEqual({ status: 'ok' })
    })
})
