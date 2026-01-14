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
   
   // Process categories: convert strings to objects, ensure proper format
   const processedCategories = categoriesArray
     .map(cat => {
       // If it's a string, convert to object
       if (typeof cat === 'string') {
         return { name: cat.toLowerCase().trim(), icon: "" };
       }
       // If it's already an object, ensure it has the right structure
       if (typeof cat === 'object' && cat !== null) {
         return {
           name: (cat.name || String(cat)).toLowerCase().trim(),
           icon: cat.icon || "",
         };
       }
       // Skip invalid entries
       return null;
     })
     .filter(cat => cat !== null && cat.name.length > 0);
   
   // Remove duplicates based on name
   const uniqueCategories = [];
   const seenNames = new Set();
   for (const cat of processedCategories) {
     if (!seenNames.has(cat.name)) {
       seenNames.add(cat.name);
       uniqueCategories.push(cat);
     }
   }
   
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
   
   // Process categories: convert strings to objects, ensure proper format
   const processedCategories = categoriesArray
     .map(cat => {
       // If it's a string, convert to object
       if (typeof cat === 'string') {
         return { name: cat.toLowerCase().trim(), icon: "" };
       }
       // If it's already an object, ensure it has the right structure
       if (typeof cat === 'object' && cat !== null) {
         return {
           name: (cat.name || String(cat)).toLowerCase().trim(),
           icon: cat.icon || "",
         };
       }
       // Skip invalid entries
       return null;
     })
     .filter(cat => cat !== null && cat.name.length > 0);
   
   // Remove duplicates based on name
   const uniqueCategories = [];
   const seenNames = new Set();
   for (const cat of processedCategories) {
     if (!seenNames.has(cat.name)) {
       seenNames.add(cat.name);
       uniqueCategories.push(cat);
     }
   }
   
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
export const addProductCategory = async (categoryData) => {
  const settings = await Settings.getSettings();
  
  // Handle both string (backward compatibility) and object formats
  let categoryName, categoryIcon;
  if (typeof categoryData === 'string') {
    categoryName = categoryData.toLowerCase().trim();
    categoryIcon = "";
  } else {
    categoryName = (categoryData.name || "").toLowerCase().trim();
    categoryIcon = categoryData.icon || "";
  }
  
  if (!categoryName) {
    throw new Error("Category name cannot be empty");
  }

  // Check if category already exists
  const existingCategory = settings.productCategories.find(
    cat => cat.name === categoryName
  );
  
  if (existingCategory) {
    throw new Error("Category already exists");
  }

  settings.productCategories.push({
    name: categoryName,
    icon: categoryIcon,
  });
  await settings.save();

  return settings;
};

/**
 * Update a product category (name and/or icon)
 */
export const updateProductCategory = async (categoryName, categoryData) => {
  const settings = await Settings.getSettings();
  
  const normalizedCategory = categoryName.toLowerCase().trim();
  
  const category = settings.productCategories.find(
    cat => cat.name === normalizedCategory
  );
  
  if (!category) {
    throw new Error("Category not found");
  }

  // Update category name if provided
  if (categoryData.name !== undefined) {
    const newName = categoryData.name.toLowerCase().trim();
    if (!newName) {
      throw new Error("Category name cannot be empty");
    }
    
    // Check if new name already exists (and it's not the same category)
    const existingCategory = settings.productCategories.find(
      cat => cat.name === newName && cat.name !== normalizedCategory
    );
    if (existingCategory) {
      throw new Error("Category name already exists");
    }
    
    category.name = newName;
  }

  // Update icon if provided
  if (categoryData.icon !== undefined) {
    category.icon = categoryData.icon || "";
  }

  await settings.save();

  return settings;
};

/**
 * Remove a product category
 */
export const removeProductCategory = async (category) => {
  const settings = await Settings.getSettings();
  
  const normalizedCategory = category.toLowerCase().trim();
  
  const categoryIndex = settings.productCategories.findIndex(
    cat => cat.name === normalizedCategory
  );
  
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
  
  // Create a map to store categories with their icons
  const categoryMap = new Map();
  
  // Add categories from settings (with icons)
  settingsCategories.forEach(cat => {
    if (cat.name) {
      categoryMap.set(cat.name.toLowerCase(), {
        name: cat.name,
        icon: cat.icon || "",
      });
    }
  });
  
  // Add categories from products (without icons if not in settings)
  productCategories.forEach(cat => {
    if (cat) {
      const normalizedCat = cat.toLowerCase();
      if (!categoryMap.has(normalizedCat)) {
        categoryMap.set(normalizedCat, {
          name: normalizedCat,
          icon: "",
        });
      }
    }
  });
  
  // Convert map to array and sort by name
  const allCategories = Array.from(categoryMap.values()).sort((a, b) => 
    a.name.localeCompare(b.name)
  );
  
  return allCategories;
};


/**
* Reset settings to defaults
*/
export const resetSettings = async () => {
 await Settings.deleteMany({});
 return await Settings.create({});
};







