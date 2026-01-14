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
     set: function (value) {
       // Handle single string
       if (typeof value === 'string') {
         return [{ name: value.toLowerCase().trim(), icon: "" }];
       }
       // Handle array
       if (Array.isArray(value)) {
         return value.map(cat => {
           // String item
           if (typeof cat === 'string') {
             return { name: cat.toLowerCase().trim(), icon: "" };
           }
           // Object item
           if (typeof cat === 'object' && cat !== null) {
             return {
               name: (cat.name || String(cat)).toLowerCase().trim(),
               icon: cat.icon || "",
             };
           }
           // Fallback
           return { name: String(cat).toLowerCase().trim(), icon: "" };
         }).filter(cat => cat.name && cat.name.length > 0);
       }
       // Return as-is for other cases
       return value;
     },
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

// Pre-save hook to normalize productCategories
SettingsSchema.pre("save", function () {
  if (this.productCategories) {
    // Convert any string values to proper object format
    this.productCategories = this.productCategories.map(cat => {
      // If it's already an object with name property, keep it
      if (typeof cat === 'object' && cat !== null && cat.name) {
        return {
          name: String(cat.name).toLowerCase().trim(),
          icon: cat.icon || "",
        };
      }
      // If it's a string, convert to object
      if (typeof cat === 'string') {
        return {
          name: cat.toLowerCase().trim(),
          icon: "",
        };
      }
      // Fallback for any other type
      return {
        name: String(cat).toLowerCase().trim(),
        icon: "",
      };
    }).filter(cat => cat.name && cat.name.length > 0);
  }
});

// Ensure only one settings document exists (singleton pattern)
SettingsSchema.statics.getSettings = async function () {
 let settings = await this.findOne().lean();
 if (!settings) {
   settings = await this.create({});
 } else {
   // Check if productCategories needs migration from old format
   if (settings.productCategories && Array.isArray(settings.productCategories)) {
     const needsMigration = settings.productCategories.some(cat => typeof cat === 'string');
     
     if (needsMigration) {
       // Migrate old string format to new object format
       const migratedCategories = settings.productCategories.map(cat => {
         if (typeof cat === 'string') {
           return { name: cat.toLowerCase().trim(), icon: "" };
         }
         return cat;
       });
       
       // Update directly in the database to avoid validation issues
       await this.updateOne(
         { _id: settings._id },
         { $set: { productCategories: migratedCategories } }
       );
       
       // Reload the document
       settings = await this.findOne();
     } else {
       // Convert back from lean to mongoose document
       settings = await this.findOne();
     }
   } else {
     // Convert back from lean to mongoose document
     settings = await this.findOne();
   }
 }
 return settings;
};


export default mongoose.model("Settings", SettingsSchema);



