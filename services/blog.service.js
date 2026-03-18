import Blog from "../models/blog.model.js";


/**
 * Get all blogs
*/
export const getAllBlogs = async (query = {}) => {
    const { title, sortBy = 'createdAt', sortOrder = 'asc' } = query;
    const filter = {};

    const blogs = await Blog.find().populate("autherId", "name")
        .sort({ createdAt: -1 }); //latest blogs first


    res.status(200).json({
        success: true,
        message: "All blogs fetched successfully",
        data: blogs
    })
}