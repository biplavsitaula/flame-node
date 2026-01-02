import express from "express";
import {
  register,
  login,
  getProfile,
  updateProfile,
  fetchAllUsers,
  fetchUserById,
  updateUserById,
  deleteUserById,
} from "../controller/auth.controller.js";
import {
  authenticate,
  checkAdmin,
  checkSuperAdmin,
} from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes
router.post("/auth/register", register);
router.post("/auth/login", login);

// Protected routes (require authentication)
router.get("/auth/profile", authenticate, getProfile);
router.put("/auth/profile", authenticate, updateProfile);

// Admin routes (require admin or super admin)
router.get("/auth/users", authenticate, checkAdmin, fetchAllUsers);
router.get("/auth/users/:id", authenticate, checkAdmin, fetchUserById);
router.put("/auth/users/:id", authenticate, checkAdmin, updateUserById);
router.delete("/auth/users/:id", authenticate, checkSuperAdmin, deleteUserById);

export default router;


