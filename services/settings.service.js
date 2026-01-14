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
 // Check if settings already exist (use lean to avoid validation issues with old data)
 const existingSettings = await Settings.findOne().lean();
 if (existingSettings) {
   throw new Error("Settings already exist. Use update instead.");
 }

 // Process productCategories if provided
 if (settingsData.productCategories !== undefined) {
   let categoriesArray;
   
   // If it's a single string, convert to array
   if (typeof settingsData.productCategories === 'string') {
     categoriesArray = [settingsData.productCategories];
   }
   // If it's already an array, use it
   else if (Array.isArray(settingsData.productCategories)) {
     categoriesArray = settingsData.productCategories;
   }
   // Otherwise, use empty array
   else {
     categoriesArray = [];
   }
   
   // Process categories: ensure all are strings and lowercase
   const processedCategories = categoriesArray
     .map(cat => {
       // If it's a string, use it
       if (typeof cat === 'string') {
         return cat.toLowerCase().trim();
       }
       // If it's an object, extract the name
       if (typeof cat === 'object' && cat !== null && cat.name) {
         return String(cat.name).toLowerCase().trim();
       }
       // Skip invalid entries
       return null;
     })
     .filter(cat => cat !== null && cat.length > 0);
   
   // Remove duplicates
   const uniqueCategories = [...new Set(processedCategories)];
   
   settingsData.productCategories = uniqueCategories;
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


 // Get existing settings or create new (this will auto-migrate old data)
 let settings = await Settings.getSettings();


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
   // Handle different input formats
   let categoriesArray;
   
   // If it's a single string, convert to array
   if (typeof settingsData.productCategories === 'string') {
     categoriesArray = [settingsData.productCategories];
   }
   // If it's already an array, use it
   else if (Array.isArray(settingsData.productCategories)) {
     categoriesArray = settingsData.productCategories;
   }
   // Otherwise, skip updating categories
   else {
     categoriesArray = [];
   }
   
   // Process categories: ensure all are strings and lowercase
   const processedCategories = categoriesArray
     .map(cat => {
       // If it's a string, use it
       if (typeof cat === 'string') {
         return cat.toLowerCase().trim();
       }
       // If it's an object, extract the name
       if (typeof cat === 'object' && cat !== null && cat.name) {
         return String(cat.name).toLowerCase().trim();
       }
       // Skip invalid entries
       return null;
     })
     .filter(cat => cat !== null && cat.length > 0);
   
   // Remove duplicates
   const uniqueCategories = [...new Set(processedCategories)];
   
   // Only update if we have valid categories
   if (uniqueCategories.length > 0 || categoriesArray.length === 0) {
     settings.productCategories = uniqueCategories;
   }
 }


 return await settings.save();
};

/**
 * Add a new product category
 */
export const addProductCategory = async (categoryName) => {
  const settings = await Settings.getSettings();
  
  // Normalize category name
  const normalizedCategory = String(categoryName).toLowerCase().trim();
  
  if (!normalizedCategory) {
    throw new Error("Category name cannot be empty");
  }

  // Check if category already exists
  if (settings.productCategories.includes(normalizedCategory)) {
    throw new Error("Category already exists");
  }

  settings.productCategories.push(normalizedCategory);
  await settings.save();

  return settings;
};

/**
 * Update a product category name
 */
export const updateProductCategory = async (categoryName, newCategoryName) => {
  const settings = await Settings.getSettings();
  
  const normalizedOldName = String(categoryName).toLowerCase().trim();
  const normalizedNewName = String(newCategoryName).toLowerCase().trim();
  
  if (!normalizedNewName) {
    throw new Error("Category name cannot be empty");
  }
  
  const categoryIndex = settings.productCategories.indexOf(normalizedOldName);
  
  if (categoryIndex === -1) {
    throw new Error("Category not found");
  }

  // Check if new name already exists (and it's not the same category)
  if (normalizedOldName !== normalizedNewName && settings.productCategories.includes(normalizedNewName)) {
    throw new Error("Category name already exists");
  }
  
  settings.productCategories[categoryIndex] = normalizedNewName;
  await settings.save();

  return settings;
};

/**
 * Remove a product category
 */
export const removeProductCategory = async (category) => {
  const settings = await Settings.getSettings();
  
  const normalizedCategory = String(category).toLowerCase().trim();
  
  const categoryIndex = settings.productCategories.indexOf(normalizedCategory);
  
  if (categoryIndex === -1) {
    throw new Error("Category not found");
  }

  settings.productCategories.splice(categoryIndex, 1);
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
    ...settingsCategories.map(cat => String(cat)?.toLowerCase()).filter(Boolean),
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







