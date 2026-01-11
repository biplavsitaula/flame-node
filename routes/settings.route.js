import express from "express";
import {
 fetchSettings,
 createNewSettings,
 updateExistingSettings,
 resetToDefaults,
 fetchProductCategories,
 addCategory,
 removeCategory,
} from "../controller/settings.controller.js";
import { authenticate, checkSuperAdmin, checkAdminViewOnly } from "../middleware/auth.middleware.js";


const router = express.Router();


// Protected routes - View (admin and super_admin)
router.get("/settings", authenticate, checkAdminViewOnly, fetchSettings);
router.get("/settings/categories", authenticate, checkAdminViewOnly, fetchProductCategories);

// Protected routes - Modify (super_admin only)
router.post("/settings", authenticate, checkSuperAdmin, createNewSettings);
router.put("/settings", authenticate, checkSuperAdmin, updateExistingSettings);
router.post("/settings/reset", authenticate, checkSuperAdmin, resetToDefaults);
router.post("/settings/categories", authenticate, checkSuperAdmin, addCategory);
router.delete("/settings/categories/:category", authenticate, checkSuperAdmin, removeCategory);


export default router;







