import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * Get all blogs
 */

export const fetchAllBlogs = asyncHandler(async (req, res) => {
    try {
        const blogs = await getAllBlogs(req.query);

        res.status(200).json({
            success: true,
            message: "Blogs fetched successfully",
            data: blogs,
        })

    } catch (error) {
        throw error;

    }
})

/**
 * Get blog by ID
 */

export const fetchBrandById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const blog = await getBlogById(id);

    if (!blog) {
        return res.status(404).json({
            success: false,
            message: "Blog not found",
        })
    }

    res.status(200).json({
        success: true,
        message: "Blog fetched successfully",
        data: blog,
    });

})

/**
* Create new blog
**/

export const createNewBlog = asyncHandler(async (req, res) => {
    const { title, ingredients, instructions, image, authorId, createdAt, updatedAt } = req.body;

    if (!title || !ingredients || !instructions || !image || !authorId || !createdAt || !updatedAt) {
        return res.status(400).json({
            success: false,
            message: "All fields are required",
        })
    }

    const blog = await createNewBlog({
        title,
        ingredients,
        instructions,
        image,
        authorId,
        createdAt,
        updatedAt,
    })

    res.status(201).json({
        success: true,
        message: "Blog created successfully",
        data: blog,
    })
})

/**
 Update blog
 */

export const updateExistingBlog = asyncnHandler(async (req, res) => {
    const { id } = req.params;
    const updatedBlog = await updateBlog(id, req.body);

    if (!updatedBlog) {
        return res.status(400).json({
            success: false,
            message: "Blog not found",
        })
    }
    res.status(200).json({
        success: true,
        message: "Blog updated successfully",
        data: updatedBlog,
    });
})

/**
 * Delete blog
 */

export const deleteBlogById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await deleteBlogById(id);
    if (!result) {
        return res.status(404).json({
            success: false,
            message: "Blog not found",
        })
    }
    res.status(200).json({
        success: true,
        message: result.message || "Blog deleted successfully",
    })
})
