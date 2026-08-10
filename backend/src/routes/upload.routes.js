import { Router } from 'express'
import { authenticate } from '../middlewares/auth.middleware.js'
import { handleUpload, uploadSingle, uploadMultiple } from '../middlewares/upload.middleware.js'
import { uploadImage, uploadMultipleImages, deleteImage } from '../controllers/upload.controller.js'

const router = Router()

// All upload routes require authentication
router.use(authenticate)

// POST /api/upload/image — Upload single image
router.post('/image', handleUpload(uploadSingle), uploadImage)

// POST /api/upload/images — Upload multiple images
router.post('/images', handleUpload(uploadMultiple), uploadMultipleImages)

// DELETE /api/upload/:publicId — Delete image from Cloudinary
router.delete('/:publicId', deleteImage)

export default router
