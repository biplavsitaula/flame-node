import express from "express";
import {
  createNewProduct,
  deleteProductById,
  fetchAllProducts,
  fetchProductById,
  updateExistingProduct,
  fetchAllBrands,
} from "../controller/product.controller.js";
import { authenticate, checkSuperAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes
router.get("/products", fetchAllProducts);
router.get("/products/brands", fetchAllBrands);
router.get("/products/:id", fetchProductById);

// Protected routes - Modify (super_admin only)
router.post("/products", authenticate, checkSuperAdmin, createNewProduct);
router.put("/products/:id", authenticate, checkSuperAdmin, updateExistingProduct);
router.delete("/products/:id", authenticate, checkSuperAdmin, deleteProductById);


export default router;
