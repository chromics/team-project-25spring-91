// src/middleware/upload.js
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const { ApiError } = require('../utils/ApiError');

// Create uploads directory if it doesn't exist
const createUploadDir = async () => {
  const uploadDir = path.join(__dirname, '../../uploads/gyms');
  try {
    await fs.access(uploadDir);
  } catch {
    await fs.mkdir(uploadDir, { recursive: true });
  }
  return uploadDir;
};

// Configure multer for memory storage (we'll process with sharp)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Check if file is an image
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new ApiError(400, 'Only image files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

// Image processing middleware
const processGymImage = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  try {
    const uploadDir = await createUploadDir();
    
    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const filename = `gym_${timestamp}_${randomString}.webp`;
    const filepath = path.join(uploadDir, filename);

    // Process image with sharp
    await sharp(req.file.buffer)
      .resize(800, 600, { 
        fit: 'cover',
        withoutEnlargement: true 
      })
      .webp({ 
        quality: 85,
        effort: 4 
      })
      .toFile(filepath);

    // Add processed image info to request
    req.processedImage = {
      filename,
      filepath,
      url: `/api/uploads/gyms/${filename}`
    };

    next();
  } catch (error) {
    console.error('Image processing error:', error);
    next(new ApiError(500, 'Error processing image'));
  }
};

const uploadGymImage = upload.single('image');

module.exports = {
  uploadGymImage,
  processGymImage,
  createUploadDir
};