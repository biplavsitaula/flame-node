import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import Blog from "./models/blog.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, ".env") });

const checkIndexes = async () => {
    try {
        await connectDB();
        const indexes = await Blog.collection.getIndexes();
        console.log("Indexes on Blog collection:", JSON.stringify(indexes, null, 2));
        mongoose.connection.close();
    } catch (error) {
        console.error("Error checking indexes:", error);
        process.exit(1);
    }
}
checkIndexes();
