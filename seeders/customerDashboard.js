import dotenv from "dotenv";
import connectDB from "../config/db.js";
import User from "../models/user.models.js";
import Product from "../models/product.models.js";
import CustomerDashboard from "../models/customerDashboard.model.js";

dotenv.config();

const seedCustomerDashboards = async () => {
    try {
        await connectDB();

        // Get users with role 'user' (customers)
        let customers = await User.find({ role: "user" });

        // If no customer-role users exist, also seed for all users to have demo data
        if (customers.length === 0) {
            console.log("⚠️  No users with role 'user' found. Using all users for demo data.");
            customers = await User.find();
        }

        if (customers.length === 0) {
            console.log("❌ No users found. Please seed users first (npm run seed:users).");
            process.exit(1);
        }

        // Get products for favorites
        const products = await Product.find().limit(20);
        if (products.length === 0) {
            console.log("❌ No products found. Please seed products first (npm run seed:products).");
            process.exit(1);
        }

        // Clear existing customer dashboards
        await CustomerDashboard.deleteMany();

        const tiers = ["Bronze", "Silver", "Gold", "Platinum"];
        const cities = ["Kathmandu", "Lalitpur", "Bhaktapur", "Pokhara", "Biratnagar"];
        const addressLabels = ["Home", "Office", "Other"];

        const dashboards = [];

        for (const customer of customers) {
            // Generate random loyalty data
            const totalPointsEarned = Math.floor(Math.random() * 12000);
            const totalPointsRedeemed = Math.floor(Math.random() * Math.min(totalPointsEarned, 3000));
            const loyaltyPoints = totalPointsEarned - totalPointsRedeemed;

            // Determine tier based on total points earned
            let membershipTier = "Bronze";
            let tierProgress = 0;

            if (totalPointsEarned >= 10000) {
                membershipTier = "Platinum";
                tierProgress = 100;
            } else if (totalPointsEarned >= 5000) {
                membershipTier = "Gold";
                tierProgress = Math.round(((totalPointsEarned - 5000) / 5000) * 100);
            } else if (totalPointsEarned >= 2000) {
                membershipTier = "Silver";
                tierProgress = Math.round(((totalPointsEarned - 2000) / 3000) * 100);
            } else {
                membershipTier = "Bronze";
                tierProgress = Math.round((totalPointsEarned / 2000) * 100);
            }

            // Random favorite products (2-6 products)
            const numFavorites = Math.floor(Math.random() * 5) + 2;
            const shuffledProducts = [...products].sort(() => Math.random() - 0.5);
            const favoriteProducts = shuffledProducts
                .slice(0, Math.min(numFavorites, products.length))
                .map((p) => p._id);

            // Random addresses (1-3)
            const numAddresses = Math.floor(Math.random() * 3) + 1;
            const addresses = [];
            for (let i = 0; i < numAddresses; i++) {
                addresses.push({
                    label: addressLabels[i % addressLabels.length],
                    address: `${Math.floor(Math.random() * 999) + 1} Street ${Math.floor(Math.random() * 50) + 1}`,
                    city: cities[Math.floor(Math.random() * cities.length)],
                    isDefault: i === 0,
                });
            }

            // Random date of birth (between 1970-2000)
            const year = Math.floor(Math.random() * 30) + 1970;
            const month = Math.floor(Math.random() * 12);
            const day = Math.floor(Math.random() * 28) + 1;
            const dateOfBirth = new Date(year, month, day);

            // Random order stats
            const totalOrders = Math.floor(Math.random() * 30) + 1;
            const totalSpent = Math.floor(Math.random() * 100000) + 5000;

            dashboards.push({
                userId: customer._id,
                loyaltyPoints,
                totalPointsEarned,
                totalPointsRedeemed,
                membershipTier,
                tierProgress: Math.min(tierProgress, 100),
                totalOrders,
                totalSpent,
                favoriteProducts,
                addresses,
                dateOfBirth,
                preferences: {
                    emailNotifications: Math.random() > 0.3,
                    smsNotifications: Math.random() > 0.6,
                    orderUpdates: true,
                    promotionalOffers: Math.random() > 0.2,
                },
            });
        }

        // Insert all dashboards
        const insertedDashboards = await CustomerDashboard.insertMany(dashboards);

        console.log(`✅ ${insertedDashboards.length} customer dashboards seeded successfully!`);
        console.log("\n📊 Dashboard Summary:");

        for (const db of insertedDashboards) {
            const user = customers.find((c) => c._id.toString() === db.userId.toString());
            console.log(
                `   - ${user?.fullName || "Unknown"}: ${db.loyaltyPoints} pts (${db.membershipTier}) | ${db.favoriteProducts.length} favorites | ${db.addresses.length} addresses`
            );
        }

        process.exit();
    } catch (error) {
        console.error("❌ Seeding failed:", error);
        process.exit(1);
    }
};

seedCustomerDashboards();
