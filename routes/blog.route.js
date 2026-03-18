import express from "express";
import { authenticate, checkSuperAdmin, checkAdminViewOnly } from "../middleware/auth.middleware.js";
import { createBlog, updateBlog, deleteBlog, getAllBlogs, getBlogById } from "../controller/blog.controller.js";

const router = express.Router();

router.get("/offers", fetchAllBlogs);
router.get("/offers/:id", fetchBlogsById);

router.post("/blogs", createBlog);

// edit need admin access
router.put("/blogs/:id", authenticate, checkAdminViewOnly, updateBlog);

// delete need admin access
router.delete("/delete:id", authenticate, checkAdminViewOnly, deleteBlog);





// router.get("/blogs", getAllBlogs);
// router.get("/blogs/:id", getBlogById);
// router.post("/blogs", authenticate, checkSuperAdmin, createBlog);
// router.put("/blogs/:id", authenticate, checkSuperAdmin, updateBlog);
// router.delete("/blogs/:id", authenticate, checkSuperAdmin, deleteBlog);

// export default router;