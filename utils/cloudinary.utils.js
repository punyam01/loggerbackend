import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs'

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

// Function to upload a file to Cloudinary
const uploadOnCloudinary = async localFilePath => {
  try {
    if (!localFilePath) return null

    // Await Cloudinary's upload response
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: 'auto' // Automatically detect the file type
    })

    // Remove the file after uploading
    fs.unlinkSync(localFilePath)
    return response
  } catch (error) {
    // Remove the locally saved file if uploading failed
    fs.unlinkSync(localFilePath)
    console.error('Error uploading to Cloudinary:', error)
    return null
  }
}

export { uploadOnCloudinary }
