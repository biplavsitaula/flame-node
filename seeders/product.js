import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "../config/db.js";
import Product from "../models/product.models.js";

dotenv.config();

const alcohols = [
  {
    name: "Tuborg Strong",
    image: "https://example.com/images/tuborg.png",
    price: 450,
    type: "beer",
  },
  {
    name: "Gorkha Premium",
    image: "https://example.com/images/gorkha.png",
    price: 420,
    type: "beer",
  },
  {
    name: "Old Monk",
    image: "https://example.com/images/old-monk.png",
    price: 1800,
    type: "rum",
  },
  {
    name: "Jack Daniel’s",
    image: "https://example.com/images/jack-daniels.png",
    price: 7500,
    type: "whiskey",
  },
  {
    name: "Absolut Vodka",
    image: "https://example.com/images/absolut.png",
    price: 6200,
    type: "vodka",
  },
  {
    name: "Bombay Sapphire",
    image: "https://example.com/images/bombay.png",
    price: 6800,
    type: "gin",
  },
  {
    name: "Bacardi Carta Blanca",
    image: "https://example.com/images/bacardi.png",
    price: 3500,
    type: "rum",
  },
];

const seedAlcohols = async () => {
  try {
    await connectDB();

    // Clear existing data (optional)
    await Product.deleteMany();

    // Insert fake data
    await Product.insertMany(alcohols);

    console.log("🍺 Alcohol products seeded successfully!");
    process.exit();
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

seedAlcohols();
