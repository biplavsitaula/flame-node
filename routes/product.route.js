import express from "express";
import {
  createNewProduct,
  deleteProductById,
  fetchAllProducts,
  fetchProductById,
  updateExistingProduct,
} from "../controller/product.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes
router.get("/products", fetchAllProducts);
router.get("/products/:id", fetchProductById);

// Protected routes
router.post("/products", authenticate, createNewProduct);
router.put("/products/:id", authenticate, updateExistingProduct);
router.delete("/products/:id", authenticate, deleteProductById);

export default router;
