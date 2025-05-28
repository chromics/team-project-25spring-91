// src/middleware/upload.js
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const { ApiError } = require('../utils/ApiError');

// Create uploads directory structure
const createUploadDir = async (entityType) => {
  const uploadDir = path.join(__dirname, `../../uploads/${entityType}`);
  try {
    await fs.access(uploadDir);
  } catch {
    await fs.mkdir(uploadDir, { recursive: true });
  }
  return uploadDir;
};

// Configure multer for memory storage
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
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

// Generic image processing middleware factory
const createImageProcessor = (entityType, dimensions = { width: 800, height: 600 }) => {
  return async (req, res, next) => {
    if (!req.file) {
      return next();
    }

    try {
      const uploadDir = await createUploadDir(entityType);
      
      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const filename = `${entityType}_${timestamp}_${randomString}.webp`;
      const filepath = path.join(uploadDir, filename);

      // Process image with sharp
      await sharp(req.file.buffer)
        .resize(dimensions.width, dimensions.height, { 
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
        url: `/api/uploads/${entityType}/${filename}`,
        entityType // Add this for cleanup if validation fails
      };

      next();
    } catch (error) {
      console.error('Image processing error:', error);
      next(new ApiError(500, 'Error processing image'));
    }
  };
};

// cleanup function for failed validations
const cleanupImageOnError = async (req) => {
  if (req.processedImage && req.processedImage.filepath) {
    try {
      await fs.unlink(req.processedImage.filepath);
      console.log('Cleaned up image after validation error:', req.processedImage.filename);
    } catch (error) {
      console.log('Could not clean up image file:', error.message);
    }
  }
};

// Specific processors for each entity type
const processGymImage = createImageProcessor('gyms');
const processGymClassImage = createImageProcessor('gym-classes');
const processCompetitionImage = createImageProcessor('competitions');
const processUserImage = createImageProcessor('users', { width: 400, height: 400 }); // Square for profile pics

// Upload handlers
const uploadGymImage = upload.single('image');
const uploadGymClassImage = upload.single('image');
const uploadCompetitionImage = upload.single('image');
const uploadUserImage = upload.single('image');

module.exports = {
  uploadGymImage,
  processGymImage,
  uploadGymClassImage,
  processGymClassImage,
  uploadCompetitionImage,
  processCompetitionImage,
  uploadUserImage,
  processUserImage,
  createUploadDir,
  cleanupImageOnError 
};