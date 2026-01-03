import express from "express";
import {
  createNewProduct,
  deleteProductById,
  fetchAllProducts,
  fetchProductById,
  updateExistingProduct,
} from "../controller/product.controller.js";
import { authenticate, checkAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes
router.get("/products", fetchAllProducts);
router.get("/products/:id", fetchProductById);

// Admin routes
router.post("/products", authenticate, checkAdmin, createNewProduct);
router.put("/products/:id", authenticate, checkAdmin, updateExistingProduct);
router.delete("/products/:id", authenticate, checkAdmin, deleteProductById);

export default router;
