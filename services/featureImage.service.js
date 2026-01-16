import FeatureImage from "../models/featureImage.model.js";

/**
 * Get all feature images
 */
export const getAllFeatureImages = async (query = {}) => {
  const { isActive, sortBy = "order", sortOrder = "asc" } = query;

  const filter = {};

  // Filter by active status
  // If isActive is explicitly provided, use it; otherwise return all images
  if (isActive !== undefined) {
    filter.isActive = isActive === "true" || isActive === true;
  }

  // Sort
  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

  const featureImages = await FeatureImage.find(filter)
    .sort(sortOptions)
    .lean();

  return featureImages;
};

/**
 * Get feature image by ID
 */
export const getFeatureImageById = async (id) => {
  const featureImage = await FeatureImage.findById(id).lean();
  if (!featureImage) {
    throw new Error("Feature image not found");
  }
  return featureImage;
};

/**
 * Create feature image
 */
export const createFeatureImage = async (featureImageData) => {
  const featureImage = new FeatureImage(featureImageData);
  await featureImage.save();
  return featureImage.toJSON();
};

/**
 * Update feature image
 */
export const updateFeatureImage = async (id, updateData) => {
  const featureImage = await FeatureImage.findByIdAndUpdate(
    id,
    updateData,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!featureImage) {
    throw new Error("Feature image not found");
  }

  return featureImage.toJSON();
};

/**
 * Delete feature image
 */
export const deleteFeatureImage = async (id) => {
  const featureImage = await FeatureImage.findByIdAndDelete(id);
  if (!featureImage) {
    throw new Error("Feature image not found");
  }
  return { message: "Feature image deleted successfully" };
};




