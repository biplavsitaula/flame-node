import mongoose from "mongoose";
import dotenv from "dotenv";
import Settings from "../models/settings.model.js";
import connectDB from "../config/db.js";


dotenv.config();


const seedSettings = async () => {
 try {
   await connectDB();
   console.log("🌱 Seeding settings...");


   // Clear existing settings
   await Settings.deleteMany({});
   console.log("🗑️  Cleared existing settings");


   // Create default settings
   const defaultSettings = {
     notifications: {
       lowStockAlerts: true,
       outOfStockAlerts: true,
       newReviewNotifications: false,
     },
     stockThresholds: {
       lowStock: 10,
       criticalStock: 5,
     },
     storeInfo: {
       storeName: "LiquorHub Premium Spirits",
       contactEmail: "admin@liquorhub.com",
     },
     theme: "default",
   };


   const settings = await Settings.create(defaultSettings);
   console.log("✅ Settings seeded successfully!");
   console.log("📋 Settings created:", JSON.stringify(settings, null, 2));


   mongoose.connection.close();
   console.log("🔌 Database connection closed");
 } catch (error) {
   console.error("❌ Error seeding settings:", error);
   process.exit(1);
 }
};


seedSettings();







