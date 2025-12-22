import { createClient, SupabaseClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL as string
const supabaseKey = process.env.SUPABASE_KEY as string

if ((!supabaseUrl || !supabaseKey) && process.env.NODE_ENV !== 'test') {
    throw new Error(
        'Missing Supabase environment variables. Please set SUPABASE_URL and SUPABASE_KEY in .env file'
    )
}

const supabase: SupabaseClient = createClient(
    supabaseUrl || 'http://placeholder.url',
    supabaseKey || 'placeholder-key'
)

const BUCKET_NAME = 'avatars'

export async function uploadAvatarToSupabase(
    file: any,
    userId: string
): Promise<{ url: string; key: string }> {
    try {
        const fileExt = file.originalname.split('.').pop()
        const fileName = `${userId}-${Date.now()}-${Math.round(Math.random() * 1e9)}.${fileExt}`
        const filePath = fileName

        const { error } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(filePath, file.buffer, {
                contentType: file.mimetype,
                upsert: false,
            })

        if (error) {
            console.error('Error uploading to Supabase:', error)
            throw new Error(`Failed to upload avatar: ${error.message}`)
        }

        const { data: urlData } = supabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(filePath)

        return {
            url: urlData.publicUrl,
            key: filePath,
        }
    } catch (error) {
        console.error('Error in uploadAvatarToSupabase:', error)
        throw error
    }
}

export async function deleteAvatarFromSupabase(
    avatarKey: string
): Promise<boolean> {
    try {
        if (!avatarKey) {
            return true
        }

        const fileName = avatarKey.split('/').pop() || avatarKey

        const { error } = await supabase.storage
            .from(BUCKET_NAME)
            .remove([fileName])

        if (error) {
            console.error('Error deleting from Supabase:', error)
            return false
        }

        return true
    } catch (error) {
        console.error('Error in deleteAvatarFromSupabase:', error)
        return false
    }
}
