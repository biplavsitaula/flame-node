import express from "express";
import {
  fetchAllOrders,
  fetchOrderById,
  fetchOrderByBillNumber,
  createNewOrder,
  updateOrder,
  deleteOrderById,
  processCheckout,
  acceptOrderController,
  rejectOrderController,
} from "../controller/order.controller.js";
import { authenticate, checkSuperAdmin, checkAdminViewOnly } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes
router.get("/orders", fetchAllOrders);
router.get("/orders/:id", fetchOrderById);
router.get("/orders/bill/:billNumber", fetchOrderByBillNumber);

// Checkout route (public - for customers)
router.post("/checkout", processCheckout);

// Order status check route (public - for customers to check their order status)
router.get("/orders/status/:billNumber", fetchOrderByBillNumber);

// Protected routes - Modify (super_admin only)
router.post("/orders", authenticate, checkSuperAdmin, createNewOrder);
router.put("/orders/:id", authenticate, checkSuperAdmin, updateOrder);
router.delete("/orders/:id", authenticate, checkSuperAdmin, deleteOrderById);

// Order acceptance/rejection (super_admin only)
router.post("/orders/:id/accept", authenticate, checkSuperAdmin, acceptOrderController);
router.post("/orders/:id/reject", authenticate, checkSuperAdmin, rejectOrderController);

export default router;






