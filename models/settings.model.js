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

   // Product categories (dynamic list with icons)
   productCategories: {
     type: [
       {
         name: {
           type: String,
           required: true,
           trim: true,
         },
         icon: {
           type: String,
           default: "",
           trim: true,
         },
       },
     ],
     default: [
       { name: "whiskey", icon: "" },
       { name: "vodka", icon: "" },
       { name: "rum", icon: "" },
       { name: "gin", icon: "" },
       { name: "tequila", icon: "" },
       { name: "cognac", icon: "" },
       { name: "champagne", icon: "" },
       { name: "wine", icon: "" },
       { name: "beer", icon: "" },
       { name: "brandy", icon: "" },
       { name: "cold drinks", icon: "" },
       { name: "juices", icon: "" },
     ],
     validate: {
       validator: function (categories) {
         // Ensure all category names are lowercase and unique
         const categoryNames = categories.map(cat => cat.name?.toLowerCase().trim()).filter(Boolean);
         const uniqueCategories = [...new Set(categoryNames)];
         return uniqueCategories.length === categoryNames.length;
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



