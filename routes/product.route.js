import express from "express";
import {
  createNewProduct,
  deleteProductById,
  fetchAllProducts,
  fetchProductById,
  updateExistingProduct,
} from "../controller/product.controller.js";
import { checkAdmin } from "../middleware/admin.middleware.js";

const router = express.Router();

// Public routes
router.get("/products", fetchAllProducts);
router.get("/products/:id", fetchProductById);

// Admin routes
router.post("/products", checkAdmin, createNewProduct);
router.put("/products/:id", checkAdmin, updateExistingProduct);
router.delete("/products/:id", checkAdmin, deleteProductById);

export default router;
