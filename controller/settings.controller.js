import {
  getSettings,
  createSettings,
  updateSettings,
  resetSettings,
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
