import { Request } from 'express'
import { UserDocument } from '../models/userModel.js'

export interface CustomRequest extends Request {
    user?: UserDocument
    file?: any
    body: any
    params: any
    query: any
    headers: any
}
