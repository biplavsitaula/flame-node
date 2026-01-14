import mongoose from "mongoose";
import dotenv from "dotenv";
import Offer from "../models/offer.model.js";
import connectDB from "../config/db.js";

dotenv.config();

const offersData = [
  {
    icon: "Truck",
    title: "Free Delivery",
    description: "Get free delivery on orders above Rs. 2000. Fast and reliable shipping to your doorstep.",
    color: "from-green-500 to-emerald-600",
    isActive: true,
    order: 0,
  },
  {
    icon: "Clock",
    title: "Express Delivery",
    description: "Need it fast? Choose express delivery and get your order within 24 hours.",
    color: "from-blue-500 to-cyan-600",
    isActive: true,
    order: 1,
  },
  {
    icon: "Gift",
    title: "Bulk Discount",
    description: "Buy in bulk and save more! Special discounts on orders above 12 bottles.",
    color: "from-purple-500 to-pink-600",
    isActive: true,
    order: 2,
  },
  {
    icon: "Sparkles",
    title: "Festival Special",
    description: "Celebrate festivals with our special offers and exclusive collections.",
    color: "from-primary-btn to-secondary-btn",
    isActive: true,
    order: 3,
  },
];

const seedOffers = async () => {
  try {
    await connectDB();
    console.log("🌱 Seeding offers...");

    // Clear existing offers
    await Offer.deleteMany({});
    console.log("🗑️  Cleared existing offers");

    // Insert offers
    const offers = await Offer.insertMany(offersData);
    console.log(`✅ ${offers.length} offers seeded successfully!`);

    offers.forEach((offer, index) => {
      console.log(`   ${index + 1}. ${offer.title} - ${offer.description.substring(0, 50)}...`);
    });

    mongoose.connection.close();
    console.log("🔌 Database connection closed");
  } catch (error) {
    console.error("❌ Error seeding offers:", error);
    process.exit(1);
  }
};

seedOffers();



