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
import { authenticate } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = express.Router();

// Public routes
router.post("/auth/register", asyncHandler(register));
router.post("/auth/login", asyncHandler(login));

// Protected routes (require authentication)
router.get("/auth/profile", authenticate, asyncHandler(getProfile));
router.put("/auth/profile", authenticate, asyncHandler(updateProfile));

// Admin routes (require authentication)
router.get("/auth/users", authenticate, asyncHandler(fetchAllUsers));
router.get("/auth/users/:id", authenticate, asyncHandler(fetchUserById));
router.put("/auth/users/:id", authenticate, asyncHandler(updateUserById));
router.delete("/auth/users/:id", authenticate, asyncHandler(deleteUserById));

export default router;





