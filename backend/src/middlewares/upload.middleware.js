import multer from 'multer'
import { AppError } from '../utils/AppError.js'

// Store in memory buffer (then upload to Cloudinary)
const storage = multer.memoryStorage()

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']

  if (!allowedTypes.includes(file.mimetype)) {
    return cb(
      new AppError('Faqat rasm fayllari qabul qilinadi (JPEG, PNG, WebP, GIF)', 400),
      false
    )
  }
  cb(null, true)
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,  // 5MB
    files: 5,
  },
})

// Single image (field name: 'image')
export const uploadSingle = upload.single('image')

// Multiple images (field name: 'images', max 5)
export const uploadMultiple = upload.array('images', 5)

// Fields (cover + gallery)
export const uploadFields = upload.fields([
  { name: 'cover',  maxCount: 1 },
  { name: 'images', maxCount: 4 },
])

/**
 * Wrapper that converts multer errors to AppError
 */
export const handleUpload = (uploadFn) => (req, res, next) => {
  uploadFn(req, res, (err) => {
    if (!err) return next()

    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(new AppError('Fayl hajmi 5MB dan oshmasligi kerak', 400))
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return next(new AppError('Maksimal 5 ta fayl yuklash mumkin', 400))
    }
    if (err instanceof multer.MulterError) {
      return next(new AppError(`Upload xatosi: ${err.message}`, 400))
    }
    next(err)
  })
}
