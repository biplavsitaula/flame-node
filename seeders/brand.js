import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "../config/db.js";
import Brand from "../models/brand.model.js";

dotenv.config();

const brandsData = [
  {
    name: "8848 VODKA",
    logo: "https://images.unsplash.com/photo-1608848942187-4d1c8a3e4b3a?w=200&h=200&fit=crop&q=80",
    description: "Premium vodka from the highest peaks",
    website: "",
    isActive: true,
    order: 1,
  },
  {
    name: "Highlander",
    logo: "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=200&h=200&fit=crop&q=80",
    description: "Scottish heritage in every bottle",
    website: "",
    isActive: true,
    order: 2,
  },
  {
    name: "TUBORG",
    logo: "https://images.unsplash.com/photo-1608848942187-4d1c8a3e4b3a?w=200&h=200&fit=crop&q=80",
    description: "Danish beer excellence since 1873",
    website: "",
    isActive: true,
    order: 3,
  },
  {
    name: "JOHNNIE WALKER",
    logo: "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=200&h=200&fit=crop&q=80",
    description: "Keep walking with the world's best-selling Scotch whisky",
    website: "",
    isActive: true,
    order: 4,
  },
  {
    name: "RUSLAN VODKA",
    logo: "https://images.unsplash.com/photo-1608848942187-4d1c8a3e4b3a?w=200&h=200&fit=crop&q=80",
    description: "100% pure vodka with Russian tradition",
    website: "",
    isActive: true,
    order: 5,
  },
  {
    name: "CHIVAS REGAL",
    logo: "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=200&h=200&fit=crop&q=80",
    description: "Live with Chivalry - Premium blended Scotch whisky",
    website: "",
    isActive: true,
    order: 6,
  },
  {
    name: "OLD DURBAR",
    logo: "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=200&h=200&fit=crop&q=80",
    description: "Nepal's finest whisky",
    website: "",
    isActive: true,
    order: 7,
  },
  {
    name: "J&B",
    logo: "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=200&h=200&fit=crop&q=80",
    description: "Rare scotch whisky since 1749",
    website: "",
    isActive: true,
    order: 8,
  },
  {
    name: "JACK DANIEL'S",
    logo: "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=200&h=200&fit=crop&q=80",
    description: "Tennessee whiskey with a rich heritage",
    website: "",
    isActive: true,
    order: 9,
  },
  {
    name: "Signature",
    logo: "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=200&h=200&fit=crop&q=80",
    description: "Premier grain whisky",
    website: "",
    isActive: true,
    order: 10,
  },
];

const seedBrands = async () => {
  try {
    await connectDB();
    console.log("🌱 Seeding brands...");

    // Clear existing brands
    await Brand.deleteMany({});
    console.log("🗑️  Cleared existing brands");

    // Insert brands
    const brands = await Brand.insertMany(brandsData);
    console.log(`✅ ${brands.length} brands seeded successfully!`);

    brands.forEach((brand) => {
      console.log(`   🏷️  ${brand.name} - Order: ${brand.order}`);
    });

    mongoose.connection.close();
    console.log("🔌 Database connection closed");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding brands:", error);
    process.exit(1);
  }
};

seedBrands();








