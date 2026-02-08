import express from 'express';
import { upload } from '../../core/middlewares/multer.js';
import { uploadMultipleImages } from './upload.controller.js';

const router = express.Router();

// POST /api/upload/images - Upload multiple images
router.post(
  '/images',
  upload.array('images', 10), // Max 10 images at a time
  uploadMultipleImages
);

export default router;
