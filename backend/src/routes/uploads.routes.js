// src/routes/uploads.routes.js
const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const { ApiError } = require('../utils/ApiError');

const router = express.Router();

// Generic file serving handler
const serveImage = (entityType) => {
  return async (req, res, next) => {
    try {
      const filename = req.params.filename;
      const filepath = path.join(__dirname, `../../uploads/${entityType}`, filename);
      
      // Check if file exists
      try {
        await fs.access(filepath);
      } catch {
        return next(new ApiError(404, 'Image not found'));
      }
      
      // Set appropriate headers
      res.set({
        'Content-Type': 'image/webp',
        'Cache-Control': 'public, max-age=31536000', // 1 year cache
      });
      
      res.sendFile(filepath);
    } catch (error) {
      next(new ApiError(500, 'Error serving image'));
    }
  };
};

// Routes for each entity type
router.get('/gyms/:filename', serveImage('gyms'));
router.get('/gym-classes/:filename', serveImage('gym-classes'));
router.get('/competitions/:filename', serveImage('competitions'));
router.get('/users/:filename', serveImage('users'));

module.exports = router;