import express from "express";
import {
  fetchAllSeasonalThemes,
  fetchCurrentSeasonalTheme,
  fetchSeasonalThemeByKeyname,
  createNewSeasonalTheme,
  updateExistingSeasonalTheme,
  deleteSeasonalThemeByKeyname,
} from "../controller/seasonalTheme.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public route - Get current seasonal theme based on settings
router.get("/seasonal-themes/current", fetchCurrentSeasonalTheme);

// Public route - Get all seasonal themes
router.get("/seasonal-themes", fetchAllSeasonalThemes);

// Public route - Get specific theme by keyname
router.get("/seasonal-themes/:keyname", fetchSeasonalThemeByKeyname);

// Protected routes - require authentication (admin only)
router.post("/seasonal-themes", authenticate, createNewSeasonalTheme);
router.put("/seasonal-themes/:keyname", authenticate, updateExistingSeasonalTheme);
router.delete("/seasonal-themes/:keyname", authenticate, deleteSeasonalThemeByKeyname);

export default router;

