import express from "express";
import {
  fetchSettings,
  createNewSettings,
  updateExistingSettings,
  resetToDefaults,
  fetchProductCategories,
  addCategory,
  updateCategory,
  removeCategory,
} from "../controller/settings.controller.js";
import { authenticate, checkSuperAdmin, checkAdminViewOnly } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes - anyone can view categories
router.get("/settings/categories", fetchProductCategories);

// Protected routes - View (admin and super_admin)
router.get("/settings", authenticate, checkAdminViewOnly, fetchSettings);

// Protected routes - Modify (super_admin only)
router.post("/settings", authenticate, checkSuperAdmin, createNewSettings);
router.put("/settings", authenticate, checkSuperAdmin, updateExistingSettings);
router.post("/settings/reset", authenticate, checkSuperAdmin, resetToDefaults);
router.post("/settings/categories", authenticate, checkSuperAdmin, addCategory);
router.put("/settings/categories/:category", authenticate, checkSuperAdmin, updateCategory);
router.delete("/settings/categories/:category", authenticate, checkSuperAdmin, removeCategory);

export default router;



