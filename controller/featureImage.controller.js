import {
  getAllFeatureImages,
  getFeatureImageById,
  createFeatureImage,
  updateFeatureImage,
  deleteFeatureImage,
} from "../services/featureImage.service.js";

/**
 * GET /feature-images
 * Get all feature images
 */
export const fetchAllFeatureImages = async (req, res) => {
  try {
    const featureImages = await getAllFeatureImages(req.query);
    res.status(200).json({
      success: true,
      message: "Feature images fetched successfully",
      data: featureImages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching feature images",
    });
  }
};

/**
 * GET /feature-images/:id
 * Get feature image by ID
 */
export const fetchFeatureImageById = async (req, res) => {
  try {
    const { id } = req.params;
    const featureImage = await getFeatureImageById(id);
    res.status(200).json({
      success: true,
      message: "Feature image fetched successfully",
      data: featureImage,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message || "Feature image not found",
    });
  }
};

/**
 * POST /feature-images
 * Create new feature image
 */
export const createNewFeatureImage = async (req, res) => {
  try {
    const { imageUrl, name, description, tag, ctaLink, isActive, order } = req.body;

    // Validate required fields with better error messages
    const missingFields = [];
    if (!imageUrl || (typeof imageUrl === 'string' && imageUrl.trim() === '')) {
      missingFields.push('imageUrl');
    }
    if (!name || (typeof name === 'string' && name.trim() === '')) {
      missingFields.push('name');
    }
    if (!description || (typeof description === 'string' && description.trim() === '')) {
      missingFields.push('description');
    }
    if (!ctaLink || (typeof ctaLink === 'string' && ctaLink.trim() === '')) {
      missingFields.push('ctaLink');
    }

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`,
      });
    }

    const featureImage = await createFeatureImage({
      imageUrl: imageUrl.trim(),
      name: name.trim(),
      description: description.trim(),
      tag: tag ? tag.trim() : "",
      ctaLink: ctaLink.trim(),
      isActive: isActive !== undefined ? isActive : true,
      order: order || 0,
    });

    res.status(201).json({
      success: true,
      message: "Feature image created successfully",
      data: featureImage,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Error creating feature image",
    });
  }
};

/**
 * PUT /feature-images/:id
 * Update feature image
 */
export const updateExistingFeatureImage = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // For update, only validate fields that are being updated
    // If a field is provided, it must not be empty
    if (updateData.imageUrl !== undefined) {
      if (!updateData.imageUrl || (typeof updateData.imageUrl === 'string' && updateData.imageUrl.trim() === '')) {
        return res.status(400).json({
          success: false,
          message: "imageUrl cannot be empty",
        });
      }
      updateData.imageUrl = updateData.imageUrl.trim();
    }
    if (updateData.name !== undefined) {
      if (!updateData.name || (typeof updateData.name === 'string' && updateData.name.trim() === '')) {
        return res.status(400).json({
          success: false,
          message: "name cannot be empty",
        });
      }
      updateData.name = updateData.name.trim();
    }
    if (updateData.description !== undefined) {
      if (!updateData.description || (typeof updateData.description === 'string' && updateData.description.trim() === '')) {
        return res.status(400).json({
          success: false,
          message: "description cannot be empty",
        });
      }
      updateData.description = updateData.description.trim();
    }
    if (updateData.ctaLink !== undefined) {
      if (!updateData.ctaLink || (typeof updateData.ctaLink === 'string' && updateData.ctaLink.trim() === '')) {
        return res.status(400).json({
          success: false,
          message: "ctaLink cannot be empty",
        });
      }
      updateData.ctaLink = updateData.ctaLink.trim();
    }
    if (updateData.tag !== undefined && updateData.tag !== null) {
      updateData.tag = updateData.tag.trim();
    }

    const featureImage = await updateFeatureImage(id, updateData);
    res.status(200).json({
      success: true,
      message: "Feature image updated successfully",
      data: featureImage,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message || "Feature image not found",
    });
  }
};

/**
 * DELETE /feature-images/:id
 * Delete feature image
 */
export const deleteFeatureImageById = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteFeatureImage(id);
    res.status(200).json({
      success: true,
      message: "Feature image deleted successfully",
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message || "Feature image not found",
    });
  }
};



