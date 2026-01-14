import {
  getSettings,
  createSettings,
  updateSettings,
  resetSettings,
  addProductCategory,
  updateProductCategory,
  removeProductCategory,
  getProductCategories,
} from "../services/settings.service.js";

/**
 * GET /settings
 * Fetch current settings (creates default if not exists)
 */
export const fetchSettings = async (req, res) => {
  try {
    const settings = await getSettings();
    res.status(200).json({
      success: true,
      message: "Settings fetched successfully",
      data: settings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching settings",
    });
  }
};

/**
 * POST /settings
 * Create initial settings (if not exists)
 */
export const createNewSettings = async (req, res) => {
  try {
    const settings = await createSettings(req.body);
    res.status(201).json({
      success: true,
      message: "Settings created successfully",
      data: settings,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Error creating settings",
    });
  }
};

/**
 * PUT /settings
 * Update settings
 */
export const updateExistingSettings = async (req, res) => {
  try {
    const settings = await updateSettings(req.body);
    res.status(200).json({
      success: true,
      message: "Settings updated successfully",
      data: settings,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Error updating settings",
    });
  }
};

/**
 * POST /settings/reset
 * Reset settings to defaults
 */
export const resetToDefaults = async (req, res) => {
  try {
    const settings = await resetSettings();
    res.status(200).json({
      success: true,
      message: "Settings reset to defaults successfully",
      data: settings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error resetting settings",
    });
  }
};

/**
 * GET /settings/categories
 * Get all product categories
 */
export const fetchProductCategories = async (req, res) => {
  try {
    const categories = await getProductCategories();
    res.status(200).json({
      success: true,
      message: "Product categories fetched successfully",
      data: categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching product categories",
    });
  }
};

/**
 * POST /settings/categories
 * Add a new product category
 */
export const addCategory = async (req, res) => {
  try {
    const { category, icon } = req.body;

    if (!category) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    const categoryData = {
      name: category,
      icon: icon || "",
    };

    const settings = await addProductCategory(categoryData);
    res.status(200).json({
      success: true,
      message: "Category added successfully",
      data: settings.productCategories,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Error adding category",
    });
  }
};

/**
 * PUT /settings/categories/:category
 * Update a product category (name and/or icon)
 */
export const updateCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { name, icon } = req.body;

    if (!category) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    const categoryData = {};
    if (name !== undefined) {
      categoryData.name = name;
    }
    if (icon !== undefined) {
      categoryData.icon = icon;
    }

    if (Object.keys(categoryData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one field (name or icon) must be provided",
      });
    }

    const settings = await updateProductCategory(category, categoryData);
    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: settings.productCategories,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Error updating category",
    });
  }
};

/**
 * DELETE /settings/categories/:category
 * Remove a product category
 */
export const removeCategory = async (req, res) => {
  try {
    const { category } = req.params;

    if (!category) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    const settings = await removeProductCategory(category);
    res.status(200).json({
      success: true,
      message: "Category removed successfully",
      data: settings.productCategories,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Error removing category",
    });
  }
};
