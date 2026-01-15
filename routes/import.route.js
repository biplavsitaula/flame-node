import express from "express";
import {
  downloadProductTemplate,
  importProductsFromExcel,
} from "../controller/import.controller.js";
import { authenticate, checkSuperAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

// Protected routes - Download template (admin and super_admin)
router.get("/import/template", authenticate, downloadProductTemplate);

// Protected routes - Import products (super_admin only)
router.post("/import/products", authenticate, checkSuperAdmin, importProductsFromExcel);

export default router;

