import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "../config/db.js";
import Blog from "../models/blog.model.js";
import User from "../models/user.models.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const blogsData = [
    {
        "title": "Classic Whiskey Sour",
        "ingredients": [
            "60ml Whiskey",
            "30ml Fresh Lemon Juice",
            "15ml Simple Syrup",
            "Ice Cubes",
            "Lemon Slice for garnish"
        ],
        "instructions": "Add whiskey, lemon juice, and simple syrup into a shaker with ice. Shake well for about 15 seconds. Strain into a glass filled with ice. Garnish with a lemon slice and serve.",
        "image": "https://images.unsplash.com/photo-1582574051532-5b6e4a6e2b9f",
        "createdAt": "2026-03-10T10:00:00Z",
        "updatedAt": "2026-03-10T10:00:00Z"
    },
    {
        "title": "Vodka Orange Splash",
        "ingredients": [
            "50ml Vodka",
            "100ml Fresh Orange Juice",
            "Ice Cubes",
            "Orange Slice"
        ],
        "instructions": "Fill a glass with ice cubes. Pour vodka over the ice, then add fresh orange juice. Stir gently and garnish with an orange slice.",
        "image": "https://images.unsplash.com/photo-1600891964599-f61ba0e24092",
        "createdAt": "2026-03-11T08:30:00Z",
        "updatedAt": "2026-03-11T08:30:00Z"
    },
    {
        "title": "Rum Pineapple Breeze",
        "ingredients": [
            "50ml White Rum",
            "80ml Pineapple Juice",
            "20ml Coconut Cream",
            "Ice Cubes",
            "Pineapple wedge"
        ],
        "instructions": "Add rum, pineapple juice, and coconut cream into a shaker with ice. Shake well until chilled. Pour into a chilled glass and garnish with a pineapple wedge.",
        "image": "https://images.unsplash.com/photo-1598514982841-6c7f9c02f6f5",
        "createdAt": "2026-03-12T12:15:00Z",
        "updatedAt": "2026-03-12T12:15:00Z"
    },

]

const seedBlogs = async () => {
    try {
        await connectDB();

        // fetch users to assign as authors
        const users = await User.find();
        if (users.length === 0) {
            console.error("❌ No users found. Please run 'npm run seed:users' first.");
            process.exit(1);
        }

        // clear existing blog
        await Blog.deleteMany({})

        // prepare blogs with valid authorIds
        const blogsToSeed = blogsData.map((blog, index) => ({
            ...blog,
            authorId: users[index % users.length]._id,
            isApproved: true
        }));

        // insert blogs
        const blogs = await Blog.insertMany(blogsToSeed);

        blogs.forEach((blog) => {
            console.log(`📝 Seeded blog: ${blog.title}`)
        })

        console.log(`✅ Successfully seeded ${blogs.length} blogs!`);
        mongoose.connection.close();


    } catch (error) {
        console.error("Error seeding blogs:", error);
        process.exit(1);

    }
}
seedBlogs();