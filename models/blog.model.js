import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Title is required"],
            trim: true
        },
        ingredients: {
            type: [String], // array of ingredients
            required: [true, "Ingredients are required"]
        },
        instructions: {
            type: String,
            required: [true, "Instructions are required"]
        },
        image: {
            type: String, // image URL
            default: ""
        },
        authorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        category: {
            type: String,
            default: "Cocktail",
            trim: true
        },
        tags: {
            type: [String],
            default: []
        },
        isApproved: {
            type: Boolean,
            default: false
        },
        timeTaken: {
            type: String,
            default: ""
        },
        difficulty: {
            type: String,
            enum: ["Easy", "Medium", "Hard"],
            default: "Easy"
        },
        totalCalories: {
            type: Number,
            default: 0
        },
        servings: {
            type: Number,
            default: 1
        },
        mixologistTips: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true // automatically creates createdAt and updatedAt
    }
);

// Index for search
blogSchema.index({ title: "text", category: "text", tags: "text" });

export default mongoose.model("Blog", blogSchema);
