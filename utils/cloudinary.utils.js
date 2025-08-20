import dotenv from 'dotenv'
dotenv.config()

import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs'

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

// Function to upload a file to Cloudinary
export const uploadOnCloudinary = async localFilePath => {
  try {
    if (!localFilePath) return null

    // Upload to Cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: 'auto' // auto-detect file type
    })

    // Remove file after successful upload
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath)
    }

    return response
  } catch (error) {
    // Clean up temp file if exists
    if (localFilePath && fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath)
    }
    console.error('Error uploading to Cloudinary:', error)
    return null
  }
}
