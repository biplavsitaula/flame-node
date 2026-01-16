import express from "express";
import {
  fetchAllFeatureImages,
  fetchFeatureImageById,
  createNewFeatureImage,
  updateExistingFeatureImage,
  deleteFeatureImageById,
} from "../controller/featureImage.controller.js";
import { authenticate, checkSuperAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes
router.get("/feature-images", fetchAllFeatureImages);
router.get("/feature-images/:id", fetchFeatureImageById);

// Protected routes - Modify (super_admin only)
router.post("/feature-images", authenticate, checkSuperAdmin, createNewFeatureImage);
router.put("/feature-images/:id", authenticate, checkSuperAdmin, updateExistingFeatureImage);
router.delete("/feature-images/:id", authenticate, checkSuperAdmin, deleteFeatureImageById);

export default router;

