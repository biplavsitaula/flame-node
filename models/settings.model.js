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
     set: function (value) {
       // Handle single string
       if (typeof value === 'string') {
         return [value.toLowerCase().trim()];
       }
       // Handle array
       if (Array.isArray(value)) {
         return value.map(cat => {
           // String item
           if (typeof cat === 'string') {
             return cat.toLowerCase().trim();
           }
           // Object item (extract name only)
           if (typeof cat === 'object' && cat !== null && cat.name) {
             return String(cat.name).toLowerCase().trim();
           }
           // Fallback
           return String(cat).toLowerCase().trim();
         }).filter(cat => cat && cat.length > 0);
       }
       // Return as-is for other cases
       return value;
     },
     validate: {
       validator: function (categories) {
         // Ensure all category names are lowercase and unique
         const categoryNames = categories.map(cat => String(cat).toLowerCase().trim()).filter(Boolean);
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

// Pre-save hook to normalize productCategories
SettingsSchema.pre("save", function () {
  if (this.productCategories) {
    // Ensure all categories are strings, lowercase, and unique
    this.productCategories = this.productCategories
      .map(cat => {
        // If it's an object, extract the name
        if (typeof cat === 'object' && cat !== null && cat.name) {
          return String(cat.name).toLowerCase().trim();
        }
        // If it's a string, use it
        if (typeof cat === 'string') {
          return cat.toLowerCase().trim();
        }
        // Fallback
        return String(cat).toLowerCase().trim();
      })
      .filter(cat => cat && cat.length > 0);
  }
});

// Ensure only one settings document exists (singleton pattern)
SettingsSchema.statics.getSettings = async function () {
 try {
   // Try to get the document using lean to bypass validation
   let settingsDoc = await this.findOne().lean();
   
   if (!settingsDoc) {
     // No document exists, create new one with defaults
     const settings = await this.create({});
     return settings;
   }
   
   // Check if productCategories needs migration from object format to string format
   if (settingsDoc.productCategories && Array.isArray(settingsDoc.productCategories)) {
     const needsMigration = settingsDoc.productCategories.some(cat => typeof cat === 'object');
     
     if (needsMigration) {
       console.log("🔄 Auto-migrating productCategories from object format to string format...");
       
       // Migrate object format to simple string format
       const migratedCategories = settingsDoc.productCategories.map(cat => {
         if (typeof cat === 'object' && cat !== null && cat.name) {
           return String(cat.name).toLowerCase().trim();
         }
         if (typeof cat === 'string') {
           return cat.toLowerCase().trim();
         }
         return String(cat).toLowerCase().trim();
       }).filter(cat => cat && cat.length > 0);
       
       // Update directly in the database using native MongoDB driver to bypass Mongoose validation
       await this.collection.updateOne(
         { _id: settingsDoc._id },
         { $set: { productCategories: migratedCategories } }
       );
       
       console.log("✅ Migration completed successfully");
     }
   }
   
   // Now load the document normally (should work after migration)
   const settings = await this.findOne();
   return settings;
   
 } catch (error) {
   console.error("Error in getSettings:", error.message);
   
   // If all else fails, delete the corrupt document and create a new one
   console.log("⚠️  Corrupt settings detected. Recreating with defaults...");
   await this.collection.deleteMany({});
   const settings = await this.create({});
   return settings;
 }
};


export default mongoose.model("Settings", SettingsSchema);



