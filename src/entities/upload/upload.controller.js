import { cloudinaryUpload } from '../../lib/cloudinaryUpload.js';
import sendResponse from '../../utility/sendResponse.js';
import catchAsync from '../../utility/catchAsync.js';

export const uploadMultipleImages = catchAsync(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return sendResponse(res, {
      statusCode: 400,
      success: false,
      message: 'No images provided',
      data: null
    });
  }

  const uploadedUrls = [];
  const errors = [];

  // Upload each file to Cloudinary
  for (const file of req.files) {
    try {
      const result = await cloudinaryUpload(
        file.path,
        `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        'hinkel-uploads/images'
      );

      if (result !== 'file upload failed') {
        uploadedUrls.push({
          filename: file.originalname,
          url: result.secure_url,
          publicId: result.public_id
        });
      } else {
        errors.push({
          filename: file.originalname,
          error: 'Upload failed'
        });
      }
    } catch (error) {
      errors.push({
        filename: file.originalname,
        error: error.message
      });
    }
  }

  const response = {
    statusCode: uploadedUrls.length > 0 ? 200 : 400,
    success: uploadedUrls.length > 0,
    message:
      uploadedUrls.length > 0
        ? 'Images uploaded successfully'
        : 'No images were uploaded',
    data: {
      uploaded: uploadedUrls,
      failed: errors.length > 0 ? errors : null,
      totalUploaded: uploadedUrls.length,
      totalFailed: errors.length
    }
  };

  sendResponse(res, response);
});
