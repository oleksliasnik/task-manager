import dotenv from 'dotenv'
import mongoose from 'mongoose'

dotenv.config()

const { DB_USER, DB_PASSWORD, DB_CLUSTER, DB_NAME, DB_APP_NAME } = process.env

const URL = `mongodb+srv://${DB_USER}:${DB_PASSWORD}@${DB_CLUSTER}/${DB_NAME}?appName=${DB_APP_NAME}`

export default mongoose
    .connect(URL)
    .then(() => {
        console.log('MongoDB connected successfully')
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err)
    })
