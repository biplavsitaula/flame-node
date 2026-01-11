import mongoose from "mongoose";


const SettingsSchema = new mongoose.Schema(
 {
   // Notifications settings
   notifications: {
     lowStockAlerts: {
       type: Boolean,
       default: true,
     },
     outOfStockAlerts: {
       type: Boolean,
       default: true,
     },
     newReviewNotifications: {
       type: Boolean,
       default: false,
     },
   },


   // Stock thresholds
   stockThresholds: {
     lowStock: {
       type: Number,
       default: 10,
       min: [0, "Low stock threshold must be positive"],
     },
     criticalStock: {
       type: Number,
       default: 5,
       min: [0, "Critical stock threshold must be positive"],
     },
   },


   // Store information
   storeInfo: {
     storeName: {
       type: String,
       default: "LiquorHub Premium Spirits",
       trim: true,
     },
     contactEmail: {
       type: String,
       default: "admin@liquorhub.com",
       trim: true,
       lowercase: true,
     },
   },


   // Theme setting
   theme: {
     type: String,
     default: "default",
     trim: true,
     lowercase: true,
   },

   // Product categories (dynamic list)
   productCategories: {
     type: [String],
     default: [
       "whiskey",
       "vodka",
       "rum",
       "gin",
       "tequila",
       "cognac",
       "champagne",
       "wine",
       "beer",
       "brandy",
       "cold drinks",
       "juices",
     ],
     validate: {
       validator: function (categories) {
         // Ensure all categories are lowercase and unique
         const uniqueCategories = [...new Set(categories.map(cat => cat.toLowerCase().trim()))];
         return uniqueCategories.length === categories.length;
       },
       message: "Categories must be unique",
     },
   },
 },
 {
   timestamps: true,
 }
);


// Ensure only one settings document exists (singleton pattern)
SettingsSchema.statics.getSettings = async function () {
 let settings = await this.findOne();
 if (!settings) {
   settings = await this.create({});
 }
 return settings;
};


export default mongoose.model("Settings", SettingsSchema);







