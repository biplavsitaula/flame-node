import express from "express";
import {
  fetchAllOrders,
  fetchOrderById,
  fetchOrderByBillNumber,
  createNewOrder,
  updateOrder,
  deleteOrderById,
} from "../controller/order.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes
router.get("/orders", fetchAllOrders);
router.get("/orders/:id", fetchOrderById);
router.get("/orders/bill/:billNumber", fetchOrderByBillNumber);

// Protected routes
router.post("/orders", authenticate, createNewOrder);
router.put("/orders/:id", authenticate, updateOrder);
router.delete("/orders/:id", authenticate, deleteOrderById);

export default router;










