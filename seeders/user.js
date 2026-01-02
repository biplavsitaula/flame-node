import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import connectDB from "../config/db.js";
import User from "../models/user.models.js";

dotenv.config();

const seedUsers = async () => {
  try {
    await connectDB();

    // Clear existing users (optional - comment out if you want to keep existing users)
    // await User.deleteMany();

    const usersData = [
      // Super Admin
      {
        fullName: "John Admin",
        email: "superadmin@flamebeverage.com",
        password: "SuperAdmin123!",
        role: "super_admin",
        mobile: "9841000001",
        isActive: true,
      },
      {
        fullName: "Super Admin User",
        email: "superadmin2@flamebeverage.com",
        password: "SuperAdmin123!",
        role: "super_admin",
        mobile: "9841000002",
        isActive: true,
      },

      // Admin Users
      {
        fullName: "Admin User 1",
        email: "admin1@flamebeverage.com",
        password: "Admin123!",
        role: "admin",
        mobile: "9841000011",
        isActive: true,
      },
      {
        fullName: "Admin User 2",
        email: "admin2@flamebeverage.com",
        password: "Admin123!",
        role: "admin",
        mobile: "9841000012",
        isActive: true,
      },
      {
        fullName: "Admin User 3",
        email: "admin3@flamebeverage.com",
        password: "Admin123!",
        role: "admin",
        mobile: "9841000013",
        isActive: true,
      },

      // Vendor Users
      {
        fullName: "Vendor User 1",
        email: "vendor1@flamebeverage.com",
        password: "Vendor123!",
        role: "vendor",
        mobile: "9841000021",
        isActive: true,
      },
      {
        fullName: "Vendor User 2",
        email: "vendor2@flamebeverage.com",
        password: "Vendor123!",
        role: "vendor",
        mobile: "9841000022",
        isActive: true,
      },
      {
        fullName: "Vendor User 3",
        email: "vendor3@flamebeverage.com",
        password: "Vendor123!",
        role: "vendor",
        mobile: "9841000023",
        isActive: true,
      },
    ];

    // Hash passwords before inserting (insertMany doesn't trigger pre-save hooks)
    const users = await Promise.all(
      usersData.map(async (userData) => {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userData.password, salt);
        return {
          ...userData,
          password: hashedPassword,
        };
      })
    );

    // Check if users already exist
    const existingUsers = await User.find({
      email: { $in: users.map((u) => u.email) },
    });

    if (existingUsers.length > 0) {
      console.log(
        `⚠️  ${existingUsers.length} users already exist. Updating passwords...`
      );
      
      // Update passwords for existing users using updateOne to bypass pre-save hook
      for (const userData of users) {
        const existingUser = existingUsers.find(
          (u) => u.email === userData.email
        );
        if (existingUser) {
          // Use updateOne to bypass pre-save hook since password is already hashed
          await User.updateOne(
            { _id: existingUser._id },
            { $set: { password: userData.password } }
          );
        }
      }

      const existingEmails = existingUsers.map((u) => u.email);
      const newUsers = users.filter((u) => !existingEmails.includes(u.email));

      if (newUsers.length > 0) {
        const insertedUsers = await User.insertMany(newUsers);
        console.log(`✅ ${insertedUsers.length} new users created!`);
      } else {
        console.log("✅ All users updated with hashed passwords.");
      }
    } else {
      // Insert all users
      const insertedUsers = await User.insertMany(users);
      console.log(`✅ ${insertedUsers.length} users seeded successfully!`);
    }

    // Display summary
    const userCounts = await User.aggregate([
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 },
        },
      },
    ]);

    console.log("\n📊 User Summary:");
    userCounts.forEach((item) => {
      console.log(`   - ${item._id}: ${item.count} users`);
    });

    console.log("\n🔑 Default Passwords:");
    console.log("   - Super Admin: SuperAdmin123!");
    console.log("   - Admin: Admin123!");
    console.log("   - Vendor: Vendor123!");

    process.exit();
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

seedUsers();


