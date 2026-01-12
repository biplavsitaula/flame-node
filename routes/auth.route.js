import express from "express";
import {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
  fetchAllUsers,
  fetchUserById,
  updateUserById,
  deleteUserById,
  requestPasswordReset,
  resetPasswordController,
} from "../controller/auth.controller.js";
import { authenticate, checkSuperAdmin, checkAdminViewOnly } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = express.Router();

// Public routes
router.post("/auth/register", asyncHandler(register));
router.post("/auth/login", asyncHandler(login));
router.post("/auth/forgot-password", asyncHandler(requestPasswordReset));
router.post("/auth/reset-password", asyncHandler(resetPasswordController));

// Logout route (requires authentication)
router.post("/auth/logout", authenticate, asyncHandler(logout));

// Protected routes (require authentication)
router.get("/auth/profile", authenticate, asyncHandler(getProfile));
router.put("/auth/profile", authenticate, asyncHandler(updateProfile));

// Admin routes (require authentication)
// View routes - admin and super_admin can view
router.get("/auth/users", authenticate, checkAdminViewOnly, asyncHandler(fetchAllUsers));
router.get("/auth/users/:id", authenticate, checkAdminViewOnly, asyncHandler(fetchUserById));

// Modify routes - only super_admin can modify
router.put("/auth/users/:id", authenticate, checkSuperAdmin, asyncHandler(updateUserById));
router.delete("/auth/users/:id", authenticate, checkSuperAdmin, asyncHandler(deleteUserById));

export default router;






