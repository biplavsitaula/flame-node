import dotenv from "dotenv";
import connectDB from "../config/db.js";
import Product from "../models/product.models.js";
import Review from "../models/review.models.js";
import { updateProductRating } from "../services/product.service.js";

dotenv.config();

const customerNames = [
  "Hari Bahadur",
  "Sita Sharma",
  "Rajesh Kumar",
  "Maya Thapa",
  "Ram Shrestha",
  "Sunita Gurung",
  "Bikash Tamang",
  "Puja Rai",
  "Anil Karki",
  "Sushma Pandey",
  "Krishna Maharjan",
  "Deepa Shrestha",
  "Nabin Thapa",
  "Rina Tamang",
  "Suresh Gurung",
];

const reviewComments = [
  "Excellent quality! Highly recommended.",
  "Great taste and smooth finish.",
  "Good value for money.",
  "Amazing product, will buy again!",
  "Perfect for special occasions.",
  "Very satisfied with the purchase.",
  "Top quality spirits.",
  "Exceeded my expectations.",
  "Best in its category.",
  "Worth every penny!",
  "Good but could be better.",
  "Decent quality for the price.",
  "Not bad, but expected more.",
  "Average quality.",
  "Could improve packaging.",
];

const seedReviews = async () => {
  try {
    await connectDB();

    // Get all products
    const products = await Product.find();
    if (products.length === 0) {
      console.log("❌ No products found. Please seed products first.");
      process.exit(1);
    }

    // Clear existing reviews
    await Review.deleteMany();

    const reviews = [];

    // Create reviews for each product
    for (const product of products) {
      // Number of reviews based on product's reviewCount
      const reviewCount = product.reviewCount || Math.floor(Math.random() * 200) + 50;

      // Create reviews with ratings that match product's average
      const targetRating = product.rating || 4.0;
      // Use reviewCount if available, otherwise generate random number between 50-200
      const numReviews = Math.min(reviewCount || Math.floor(Math.random() * 150) + 50, 100); // Limit to 100 reviews per product

      for (let i = 0; i < numReviews; i++) {
        // Generate rating that averages to targetRating
        let rating;
        if (i < numReviews * 0.6) {
          // 60% are 4-5 stars
          rating = Math.floor(Math.random() * 2) + 4;
        } else if (i < numReviews * 0.9) {
          // 30% are 3-4 stars
          rating = Math.floor(Math.random() * 2) + 3;
        } else {
          // 10% are 1-3 stars
          rating = Math.floor(Math.random() * 3) + 1;
        }

        // Adjust to match target rating better
        if (targetRating >= 4.5 && rating < 4) {
          rating = 4;
        } else if (targetRating < 3.5 && rating > 3) {
          rating = 3;
        }

        const customerName =
          customerNames[Math.floor(Math.random() * customerNames.length)];
        const comment =
          Math.random() > 0.2
            ? reviewComments[Math.floor(Math.random() * reviewComments.length)]
            : "";

        // Random date within last 6 months
        const daysAgo = Math.floor(Math.random() * 180);
        const createdAt = new Date();
        createdAt.setDate(createdAt.getDate() - daysAgo);

        reviews.push({
          productId: product._id,
          customerName,
          rating,
          comment,
          isVerified: Math.random() > 0.3,
          createdAt,
          updatedAt: createdAt,
        });
      }
    }

    // Insert reviews in batches
    const batchSize = 100;
    for (let i = 0; i < reviews.length; i += batchSize) {
      const batch = reviews.slice(i, i + batchSize);
      await Review.insertMany(batch);
    }

    // Update product ratings
    console.log("Updating product ratings...");
    for (const product of products) {
      await updateProductRating(product._id);
    }

    const totalReviews = await Review.countDocuments();
    console.log(`✅ ${totalReviews} reviews seeded successfully!`);
    process.exit();
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

seedReviews();

