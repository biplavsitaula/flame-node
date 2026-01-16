import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "../config/db.js";
import FeatureImage from "../models/featureImage.model.js";

dotenv.config();

const featureImagesData = [
  {
    imageUrl: "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=1400&h=500&fit=crop&q=80",
    name: "Premium Whiskey Collection",
    description: "Discover the finest aged spirits from around the world",
    tag: "Shop Now",
    ctaLink: "/products?category=whiskey",
    isActive: true,
    order: 1,
  },
  {
    imageUrl: "https://images.unsplash.com/photo-1608848942187-4d1c8a3e4b3a?w=1400&h=500&fit=crop&q=80",
    name: "Vodka Selection",
    description: "Premium vodka brands for every occasion",
    tag: "Explore",
    ctaLink: "/products?category=vodka",
    isActive: true,
    order: 2,
  },
  {
    imageUrl: "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=1400&h=500&fit=crop&q=80",
    name: "Rum & Gin Collection",
    description: "Tropical flavors and classic spirits",
    tag: "Discover",
    ctaLink: "/products?category=rum",
    isActive: true,
    order: 3,
  },
  {
    imageUrl: "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=1400&h=500&fit=crop&q=80",
    name: "Champagne & Wine",
    description: "Celebrate with premium sparkling wines",
    tag: "Celebrate",
    ctaLink: "/products?category=champagne",
    isActive: true,
    order: 4,
  },
  {
    imageUrl: "https://images.unsplash.com/photo-1608848942187-4d1c8a3e4b3a?w=1400&h=500&fit=crop&q=80",
    name: "Tequila & Cognac",
    description: "Premium aged spirits for connoisseurs",
    tag: "Explore",
    ctaLink: "/products?category=tequila",
    isActive: true,
    order: 5,
  },
];

const seedFeatureImages = async () => {
  try {
    await connectDB();
    console.log("🌱 Seeding feature images...");

    // Clear existing feature images
    await FeatureImage.deleteMany({});
    console.log("🗑️  Cleared existing feature images");

    // Insert feature images
    const featureImages = await FeatureImage.insertMany(featureImagesData);
    console.log(`✅ ${featureImages.length} feature images seeded successfully!`);

    featureImages.forEach((image) => {
      console.log(`   🖼️  ${image.name} - Order: ${image.order}`);
    });

    mongoose.connection.close();
    console.log("🔌 Database connection closed");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding feature images:", error);
    process.exit(1);
  }
};

seedFeatureImages();

