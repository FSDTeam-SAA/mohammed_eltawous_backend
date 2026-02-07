import Cms from './cms.model.js';
import { cloudinaryUpload } from '../../lib/cloudinaryUpload.js';

/**
 * Create new CMS content
 */
export const createCmsContent = async (data, imageFile) => {
  let imageUrl = null;

  // Upload image to Cloudinary if provided
  if (imageFile) {
    const sanitizedName = `cms-${data.type}-${Date.now()}`.replace(/\s+/g, '-');
    const result = await cloudinaryUpload(imageFile.path, sanitizedName, 'cms');
    imageUrl = result.url || null;
  }

  const cmsContent = await Cms.create({
    ...data,
    image: imageUrl
  });

  return cmsContent;
};

/**
 * Get all CMS content with optional filtering
 */
export const getAllCmsContent = async (query = {}) => {
  const {
    type,
    isActive,
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = query;

  const filter = {};
  if (type) filter.type = type;
  if (isActive !== undefined) filter.isActive = isActive === 'true';

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

  const [contents, total] = await Promise.all([
    Cms.find(filter).sort(sort).skip(skip).limit(parseInt(limit)),
    Cms.countDocuments(filter)
  ]);

  return {
    contents,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit))
    }
  };
};

/**
 * Get CMS content by type
 */
export const getCmsContentByType = async (type, query = {}) => {
  const { isActive, page = 1, limit = 10 } = query;

  const filter = { type };
  if (isActive !== undefined) filter.isActive = isActive === 'true';

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [contents, total] = await Promise.all([
    Cms.find(filter)
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Cms.countDocuments(filter)
  ]);

  return {
    contents,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit))
    }
  };
};

/**
 * Get CMS content by ID
 */
export const getCmsContentById = async (id) => {
  const content = await Cms.findById(id);
  return content;
};

/**
 * Update CMS content by ID
 */
export const updateCmsContentById = async (id, data, imageFile) => {
  const existingContent = await Cms.findById(id);
  if (!existingContent) return null;

  let imageUrl = existingContent.image;

  // Upload new image if provided
  if (imageFile) {
    const sanitizedName =
      `cms-${data.type || existingContent.type}-${Date.now()}`.replace(
        /\s+/g,
        '-'
      );
    const result = await cloudinaryUpload(imageFile.path, sanitizedName, 'cms');
    imageUrl = result.url || existingContent.image;
  }

  const updatedContent = await Cms.findByIdAndUpdate(
    id,
    {
      ...data,
      image: imageUrl
    },
    { new: true, runValidators: true }
  );

  return updatedContent;
};

/**
 * Delete CMS content by ID
 */
export const deleteCmsContentById = async (id) => {
  const deletedContent = await Cms.findByIdAndDelete(id);
  return deletedContent;
};

/**
 * Get distinct types
 */
export const getDistinctTypes = async () => {
  const types = await Cms.distinct('type');
  return types;
};

/**
 * Bulk update order
 */
export const updateCmsOrder = async (items) => {
  const bulkOps = items.map((item) => ({
    updateOne: {
      filter: { _id: item.id },
      update: { order: item.order }
    }
  }));

  await Cms.bulkWrite(bulkOps);
  return true;
};
