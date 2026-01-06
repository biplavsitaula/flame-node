import Settings from "../models/settings.model.js";


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


 return await settings.save();
};


/**
* Reset settings to defaults
*/
export const resetSettings = async () => {
 await Settings.deleteMany({});
 return await Settings.create({});
};







