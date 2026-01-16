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

    // Validate required fields
    if (!imageUrl || !name || !description || !ctaLink) {
      return res.status(400).json({
        success: false,
        message: "imageUrl, name, description, and ctaLink are required",
      });
    }

    const featureImage = await createFeatureImage({
      imageUrl,
      name,
      description,
      tag: tag || "",
      ctaLink,
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
    const featureImage = await updateFeatureImage(id, req.body);
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

