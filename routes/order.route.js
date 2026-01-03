import express from "express";
import {
  fetchAllOrders,
  fetchOrderById,
  fetchOrderByBillNumber,
  createNewOrder,
  updateOrder,
  deleteOrderById,
} from "../controller/order.controller.js";
import { authenticate, checkAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes
router.get("/orders", fetchAllOrders);
router.get("/orders/:id", fetchOrderById);
router.get("/orders/bill/:billNumber", fetchOrderByBillNumber);

// Admin routes
router.post("/orders", authenticate, checkAdmin, createNewOrder);
router.put("/orders/:id", authenticate, checkAdmin, updateOrder);
router.delete("/orders/:id", authenticate, checkAdmin, deleteOrderById);

export default router;










