import express from "express";
import { authenticate, checkAdminViewOnly } from "../middleware/auth.middleware.js";
import { 
    createNewBlog, 
    updateExistingBlog, 
    deleteBlogById, 
    fetchAllBlogs, 
    fetchBlogById, 
    approveBlog 
} from "../controller/blog.controller.js";

const router = express.Router();

/**
 * @route   GET /api/blogs
 * @desc    Get all blogs (with pagination and filtering)
 * @access  Public
 */
router.get("/blogs", fetchAllBlogs);

/**
 * @route   GET /api/blogs/:id
 * @desc    Get blog by ID
 * @access  Public
 */
router.get("/blogs/:id", fetchBlogById);

/**
 * @route   POST /api/blogs
 * @desc    Create a new blog
 * @access  Private (User)
 */
router.post("/blogs", authenticate, createNewBlog);

/**
 * @route   PUT /api/blogs/:id
 * @desc    Update an existing blog
 * @access  Private (Admin/SuperAdmin)
 */
router.put("/blogs/:id", authenticate, checkAdminViewOnly, updateExistingBlog);

/**
 * @route   DELETE /api/blogs/:id
 * @desc    Delete a blog
 * @access  Private (Admin/SuperAdmin)
 */
router.delete("/blogs/:id", authenticate, checkAdminViewOnly, deleteBlogById);

/**
 * @route   PATCH /api/blogs/:id/approve
 * @desc    Approve/Reject a blog
 * @access  Private (Admin/SuperAdmin)
 */
router.patch("/blogs/:id/approve", authenticate, checkAdminViewOnly, approveBlog);

export default router;