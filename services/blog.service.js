import Blog from "../models/blog.model.js";

/**
 * Get all blogs with filtering and pagination
 */
export const getAllBlogs = async (query = {}) => {
    const {
        search,
        category,
        isApproved,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        page = 1,
        limit = 10
    } = query;

    const filter = {};

    if (search) {
        filter.$or = [
            { title: { $regex: search, $options: "i" } },
            { category: { $regex: search, $options: "i" } },
            { tags: { $regex: search, $options: "i" } }
        ];
    }

    if (category) filter.category = category;
    
    // Default behavior: show only approved blogs to public, 
    // unless explicitly requested otherwise (e.g. for admin)
    if (isApproved !== undefined) {
        filter.isApproved = isApproved === 'true';
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const blogs = await Blog.find(filter)
        .populate("authorId", "fullName email")
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

    const total = await Blog.countDocuments(filter);

    return {
        blogs,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / parseInt(limit))
        }
    };
};

/**
 * Get blog by ID
 */
export const getBlogById = async (id) => {
    return await Blog.findById(id).populate("authorId", "fullName email").lean();
};

/**
 * Create new blog
 */
export const createBlog = async (blogData) => {
    const blog = new Blog(blogData);
    return await blog.save();
};

/**
 * Update existing blog
 */
export const updateBlog = async (id, blogData) => {
    return await Blog.findByIdAndUpdate(id, blogData, {
        new: true,
        runValidators: true,
    });
};

/**
 * Delete blog
 */
export const deleteBlog = async (id) => {
    return await Blog.findByIdAndDelete(id);
};

/**
 * Approve/Reject blog
 */
export const approveBlog = async (id, isApprovedStatus) => {
    return await Blog.findByIdAndUpdate(
        id,
        { isApproved: isApprovedStatus },
        { new: true }
    );
};