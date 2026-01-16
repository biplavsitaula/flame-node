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
router.get("/products/:id", fetchProductById);

// Public routes - Brands (GET)
router.get("/products/brands", fetchAllBrandsFromController);
router.get("/products/brands/:id", fetchBrandById);

// Protected routes - Products (super_admin only)
router.post("/products", authenticate, checkSuperAdmin, createNewProduct);
router.put("/products/:id", authenticate, checkSuperAdmin, updateExistingProduct);
router.delete("/products/:id", authenticate, checkSuperAdmin, deleteProductById);

// Protected routes - Brands (super_admin only)
router.post("/products/brands", authenticate, checkSuperAdmin, createNewBrand);
router.put("/products/brands/:id", authenticate, checkSuperAdmin, updateExistingBrand);
router.delete("/products/brands/:id", authenticate, checkSuperAdmin, deleteBrandById);

export default router;
