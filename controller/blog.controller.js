import { asyncHandler } from "../utils/asyncHandler.js";
import * as blogService from "../services/blog.service.js";

/**
 * Get all blogs
 */
export const fetchAllBlogs = asyncHandler(async (req, res) => {
    const result = await blogService.getAllBlogs(req.query);
    res.status(200).json({
        success: true,
        message: "Blogs fetched successfully",
        data: result.blogs,
        pagination: result.pagination
    });
});

/**
 * Get blog by ID
 */
export const fetchBlogById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const blog = await blogService.getBlogById(id);

    if (!blog) {
        return res.status(404).json({
            success: false,
            message: "Blog not found",
        });
    }

    res.status(200).json({
        success: true,
        message: "Blog fetched successfully",
        data: blog,
    });
});

/**
 * Create new blog
 */
export const createNewBlog = asyncHandler(async (req, res) => {
    const { title, ingredients, instructions, image, category, tags } = req.body;

    if (!title || !ingredients || !instructions) {
        return res.status(400).json({
            success: false,
            message: "Title, ingredients, and instructions are required",
        });
    }

    const blog = await blogService.createBlog({
        title,
        ingredients,
        instructions,
        image,
        category,
        tags,
        authorId: req.user.userId 
    });

    res.status(201).json({
        success: true,
        message: "Blog created successfully",
        data: blog,
    });
});

/**
 * Update blog
 */
export const updateExistingBlog = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updatedBlog = await blogService.updateBlog(id, req.body);

    if (!updatedBlog) {
        return res.status(404).json({
            success: false,
            message: "Blog not found",
        });
    }

    res.status(200).json({
        success: true,
        message: "Blog updated successfully",
        data: updatedBlog,
    });
});

/**
 * Delete blog
 */
export const deleteBlogById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await blogService.deleteBlog(id);

    if (!result) {
        return res.status(404).json({
            success: false,
            message: "Blog not found",
        });
    }

    res.status(200).json({
        success: true,
        message: "Blog deleted successfully",
    });
});

/**
 * Approve/Reject blog (Admin only)
 */
export const approveBlog = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { isApproved } = req.body;

    if (isApproved === undefined) {
        return res.status(400).json({
            success: false,
            message: "isApproved status is required",
        });
    }

    const blog = await blogService.approveBlog(id, isApproved);

    if (!blog) {
        return res.status(404).json({
            success: false,
            message: "Blog not found",
        });
    }

    res.status(200).json({
        success: true,
        message: `Blog ${isApproved ? "approved" : "rejected"} successfully`,
        data: blog,
    });
});
