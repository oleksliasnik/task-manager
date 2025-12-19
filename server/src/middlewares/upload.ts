import express from 'express'
import multer from 'multer'

const storage = multer.memoryStorage()

const fileFilter = (
    _req: express.Request,
    file: any,
    cb: multer.FileFilterCallback
) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true)
    } else {
        cb(new Error('Only images are allowed') as any)
    }
}

export const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 500 * 1024, // 500KB limit
    },
})
