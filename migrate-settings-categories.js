import mongoose from "mongoose";
import dotenv from "dotenv";
import Settings from "./models/settings.model.js";

// Load environment variables
dotenv.config();

// MongoDB connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Migration function
const migrateCategories = async () => {
  try {
    console.log("🔍 Checking for settings to migrate...");
    
    // Find the settings document using lean to avoid validation
    const settings = await Settings.findOne().lean();
    
    if (!settings) {
      console.log("✅ No settings document found. Nothing to migrate.");
      return;
    }
    
    // Check if productCategories needs migration
    if (!settings.productCategories || !Array.isArray(settings.productCategories)) {
      console.log("✅ No productCategories to migrate.");
      return;
    }
    
    const needsMigration = settings.productCategories.some(cat => typeof cat === 'string');
    
    if (!needsMigration) {
      console.log("✅ productCategories are already in the correct format.");
      return;
    }
    
    console.log("🔄 Migrating productCategories from string format to object format...");
    console.log("📋 Old format:", JSON.stringify(settings.productCategories, null, 2));
    
    // Migrate categories
    const migratedCategories = settings.productCategories.map(cat => {
      if (typeof cat === 'string') {
        return { name: cat.toLowerCase().trim(), icon: "" };
      }
      return {
        name: (cat.name || "").toLowerCase().trim(),
        icon: cat.icon || "",
      };
    }).filter(cat => cat.name && cat.name.length > 0);
    
    console.log("📋 New format:", JSON.stringify(migratedCategories, null, 2));
    
    // Update the document directly in the database
    await Settings.updateOne(
      { _id: settings._id },
      { $set: { productCategories: migratedCategories } }
    );
    
    console.log("✅ Migration completed successfully!");
    
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    throw error;
  }
};

// Run migration
const run = async () => {
  try {
    await connectDB();
    await migrateCategories();
    console.log("\n🎉 All done!");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Migration script failed:", error);
    process.exit(1);
  }
};

run();

