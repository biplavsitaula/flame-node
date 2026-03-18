import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
    {
        id: {
            type: String,
            required: true,
            unique: true
        },
        title: {
            type: String,
            required: true,
            trim: true
        },
        ingredients: {
            type: [String], // array of ingredients
            required: true
        },
        instructions: {
            type: String,
            required: true
        },
        image: {
            type: String, // image URL
            default: ""
        },
        authorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    {
        timestamps: true // automatically creates createdAt and updatedAt
    }
);

export default mongoose.model("Blog", blogSchema);
