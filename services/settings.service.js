import Settings from "../models/settings.model.js";
import Product from "../models/product.models.js";


/**
* Get current settings (creates default if not exists)
*/
export const getSettings = async () => {
 return await Settings.getSettings();
};


/**
* Create initial settings (if not exists)
*/
export const createSettings = async (settingsData) => {
 // Check if settings already exist
 const existingSettings = await Settings.findOne();
 if (existingSettings) {
   throw new Error("Settings already exist. Use update instead.");
 }


 const settings = new Settings(settingsData);
 return await settings.save();
};


/**
* Update settings
*/
export const updateSettings = async (settingsData) => {
 const {
   notifications,
   stockThresholds,
   storeInfo,
   theme,
 } = settingsData;


 // Get existing settings or create new
 let settings = await Settings.findOne();
  if (!settings) {
   settings = new Settings();
 }


 // Update notifications if provided
 if (notifications) {
   if (notifications.lowStockAlerts !== undefined) {
     settings.notifications.lowStockAlerts = notifications.lowStockAlerts;
   }
   if (notifications.outOfStockAlerts !== undefined) {
     settings.notifications.outOfStockAlerts = notifications.outOfStockAlerts;
   }
   if (notifications.newReviewNotifications !== undefined) {
     settings.notifications.newReviewNotifications = notifications.newReviewNotifications;
   }
 }


 // Update stock thresholds if provided
 if (stockThresholds) {
   if (stockThresholds.lowStock !== undefined) {
     settings.stockThresholds.lowStock = Number(stockThresholds.lowStock);
   }
   if (stockThresholds.criticalStock !== undefined) {
     settings.stockThresholds.criticalStock = Number(stockThresholds.criticalStock);
   }
 }


 // Update store info if provided
 if (storeInfo) {
   if (storeInfo.storeName !== undefined) {
     settings.storeInfo.storeName = storeInfo.storeName;
   }
   if (storeInfo.contactEmail !== undefined) {
     settings.storeInfo.contactEmail = storeInfo.contactEmail;
   }
 }


 // Update theme if provided
 if (theme !== undefined) {
   settings.theme = theme;
 }

 // Update product categories if provided
 if (settingsData.productCategories !== undefined) {
   // Ensure all categories are lowercase and unique
   const uniqueCategories = [...new Set(
     settingsData.productCategories
       .map(cat => cat.toLowerCase().trim())
       .filter(cat => cat.length > 0)
   )];
   settings.productCategories = uniqueCategories;
 }


 return await settings.save();
};

/**
 * Add a new product category
 */
export const addProductCategory = async (category) => {
  const settings = await Settings.getSettings();
  
  const normalizedCategory = category.toLowerCase().trim();
  
  if (!normalizedCategory) {
    throw new Error("Category name cannot be empty");
  }

  if (settings.productCategories.includes(normalizedCategory)) {
    throw new Error("Category already exists");
  }

  settings.productCategories.push(normalizedCategory);
  await settings.save();

  return settings;
};

/**
 * Remove a product category
 */
export const removeProductCategory = async (category) => {
  const settings = await Settings.getSettings();
  
  const normalizedCategory = category.toLowerCase().trim();
  
  const index = settings.productCategories.indexOf(normalizedCategory);
  if (index === -1) {
    throw new Error("Category not found");
  }

  settings.productCategories.splice(index, 1);
  await settings.save();

  return settings;
};

/**
 * Get all product categories (from existing products + settings)
 */
export const getProductCategories = async () => {
  // Get distinct categories from actual products in the database
  const productCategories = await Product.distinct("category");
  
  // Get categories from settings
  const settings = await Settings.getSettings();
  const settingsCategories = settings.productCategories || [];
  
  // Merge and return unique categories (lowercase, sorted)
  const allCategories = [...new Set([
    ...productCategories.map(cat => cat?.toLowerCase()).filter(Boolean),
    ...settingsCategories.map(cat => cat?.toLowerCase()).filter(Boolean),
  ])].sort();
  
  return allCategories;
};


/**
* Reset settings to defaults
*/
export const resetSettings = async () => {
 await Settings.deleteMany({});
 return await Settings.create({});
};







