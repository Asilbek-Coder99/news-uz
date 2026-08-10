import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure:     true,
})

/**
 * Upload image buffer to Cloudinary
 * @param {Buffer} buffer - Image buffer
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} Cloudinary upload result
 */
export const uploadToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder:         process.env.CLOUDINARY_FOLDER || 'newsuz',
      transformation: [
        { quality: 'auto', fetch_format: 'auto' },
      ],
      ...options,
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) reject(error)
        else resolve(result)
      }
    )

    uploadStream.end(buffer)
  })
}

/**
 * Delete image from Cloudinary
 * @param {string} publicId - Cloudinary public_id
 */
export const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return
  try {
    await cloudinary.uploader.destroy(publicId)
  } catch (error) {
    console.error('Cloudinary delete error:', error)
  }
}

/**
 * Extract public_id from Cloudinary URL
 * @param {string} url - Full Cloudinary URL
 * @returns {string} public_id
 */
export const getPublicIdFromUrl = (url) => {
  if (!url) return null
  const parts = url.split('/')
  const folder = process.env.CLOUDINARY_FOLDER || 'newsuz'
  const folderIndex = parts.indexOf(folder)
  if (folderIndex === -1) return null
  const filename = parts[parts.length - 1].split('.')[0]
  return `${folder}/${filename}`
}

export default cloudinary
