import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js'
import { asyncHandler } from '../utils/AppError.js'
import { successResponse, createdResponse } from '../utils/response.js'
import { AppError } from '../utils/AppError.js'

/**
 * POST /api/upload/image
 * Upload a single image to Cloudinary
 */
export const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError('Fayl yuklanmadi', 400)
  }

  const result = await uploadToCloudinary(req.file.buffer, {
    transformation: [
      { width: 1280, height: 720, crop: 'fill', gravity: 'auto' },
      { quality: 'auto', fetch_format: 'auto' },
    ],
  })

  return createdResponse(res, {
    url:       result.secure_url,
    publicId:  result.public_id,
    width:     result.width,
    height:    result.height,
    format:    result.format,
    bytes:     result.bytes,
  }, 'Rasm muvaffaqiyatli yuklandi')
})

/**
 * POST /api/upload/images
 * Upload multiple images
 */
export const uploadMultipleImages = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    throw new AppError('Fayllar yuklanmadi', 400)
  }

  const uploads = await Promise.all(
    req.files.map((file) =>
      uploadToCloudinary(file.buffer, {
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
      })
    )
  )

  const images = uploads.map((result) => ({
    url:      result.secure_url,
    publicId: result.public_id,
    width:    result.width,
    height:   result.height,
  }))

  return createdResponse(res, { images }, `${images.length} ta rasm yuklandi`)
})

/**
 * DELETE /api/upload/:publicId
 */
export const deleteImage = asyncHandler(async (req, res) => {
  const { publicId } = req.params
  await deleteFromCloudinary(decodeURIComponent(publicId))
  return successResponse(res, null, 'Rasm o\'chirildi')
})
