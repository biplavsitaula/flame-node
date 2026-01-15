import express from "express";
import {
  downloadProductTemplate,
  importProductsFromExcel,
} from "../controller/import.controller.js";

const router = express.Router();

// Public routes - Download template
router.get("/import/template", downloadProductTemplate);

// Public routes - Import products
router.post("/import/products", importProductsFromExcel);

export default router;
