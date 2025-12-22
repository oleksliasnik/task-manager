import express from 'express'
import cors from 'cors'
import './config/db.js'
// Routes
import authRouter from './routes/authRoutes.js'
import taskRouter from './routes/taskRoutes.js'

const app = express()
const port = process.env.PORT || 3000
const clientUrl = process.env.CLIENT_URL

// middleware
app.use(
    cors({
        origin: clientUrl,
    })
)
app.use(express.json())

app.get('/api/health', (_req, res) => {
    res.status(200).json({ status: 'ok' })
})

app.use('/api', authRouter)
app.use('/api', taskRouter)

export { app }

if (process.env.NODE_ENV !== 'test') {
    app.listen(port, () => {
        console.log(
            `Server listening on port ${port} and started at http://localhost:${port}`
        )
    })
}
