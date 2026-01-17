import express from "express";
import {
  createNewProduct,
  deleteProductById,
  fetchAllProducts,
  fetchProductById,
  updateExistingProduct,
} from "../controller/product.controller.js";
import {
  fetchAllBrands as fetchAllBrandsFromController,
  fetchBrandById,
  createNewBrand,
  updateExistingBrand,
  deleteBrandById,
} from "../controller/brand.controller.js";
import { authenticate, checkSuperAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes - Products
router.get("/products", fetchAllProducts);

// Public routes - Brands (GET) - Must be before /products/:id to avoid route conflictsrouter.get("/products/brands", fetchAllBrandsFromController);
router.get("/products/brands/:id", fetchBrandById);

// Public routes - Products (by ID) - Must be after /products/brands
router.get("/products/:id", fetchProductById);

// Protected routes - Brands (super_admin only) - Must be before /products/:id
router.post("/products/brands", authenticate, checkSuperAdmin, createNewBrand);
router.put("/products/brands/:id", authenticate, checkSuperAdmin, updateExistingBrand);
router.delete("/products/brands/:id", authenticate, checkSuperAdmin, deleteBrandById);

// Protected routes - Products (super_admin only)
router.post("/products", authenticate, checkSuperAdmin, createNewProduct);
router.put("/products/:id", authenticate, checkSuperAdmin, updateExistingProduct);
router.delete("/products/:id", authenticate, checkSuperAdmin, deleteProductById);

export default router;
