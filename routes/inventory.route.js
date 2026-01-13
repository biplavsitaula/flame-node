import express from "express";
import {
  fetchAllInventoryTransactions,
  fetchInventoryTransactionById,
  fetchProductStockHistory,
  addBulkStock,
  removeBulkStock,
} from "../controller/inventory.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

// Protected routes (require authentication)
router.get("/inventory", authenticate, fetchAllInventoryTransactions);
router.get("/inventory/:id", authenticate, fetchInventoryTransactionById);
router.get("/inventory/product/:productId", authenticate, fetchProductStockHistory);

// Bulk stock operations
router.post("/inventory/add", authenticate, addBulkStock);
router.post("/inventory/remove", authenticate, removeBulkStock);

export default router;


