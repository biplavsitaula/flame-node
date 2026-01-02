import express from "express";
import {
  fetchAllOrders,
  fetchOrderById,
  fetchOrderByBillNumber,
  createNewOrder,
  updateOrder,
  deleteOrderById,
} from "../controller/order.controller.js";
import { checkAdmin } from "../middleware/admin.middleware.js";

const router = express.Router();

// Public routes
router.get("/orders", fetchAllOrders);
router.get("/orders/:id", fetchOrderById);
router.get("/orders/bill/:billNumber", fetchOrderByBillNumber);

// Admin routes
router.post("/orders", checkAdmin, createNewOrder);
router.put("/orders/:id", checkAdmin, updateOrder);
router.delete("/orders/:id", checkAdmin, deleteOrderById);

export default router;









