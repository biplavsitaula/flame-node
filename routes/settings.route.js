import express from "express";
import {
 fetchSettings,
 createNewSettings,
 updateExistingSettings,
 resetToDefaults,
} from "../controller/settings.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";


const router = express.Router();


// Protected routes - require authentication
router.get("/settings", authenticate, fetchSettings);
router.post("/settings", authenticate, createNewSettings);
router.put("/settings", authenticate, updateExistingSettings);
router.post("/settings/reset", authenticate, resetToDefaults);


export default router;







