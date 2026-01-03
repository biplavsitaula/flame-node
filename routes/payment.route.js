import express from "express";
import {
  fetchAllPayments,
  fetchPaymentById,
  fetchPaymentSummary,
  createNewPayment,
  updatePayment,
  deletePaymentById,
} from "../controller/payment.controller.js";
import { authenticate, checkAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes
router.get("/payments", fetchAllPayments);
router.get("/payments/summary", fetchPaymentSummary);
router.get("/payments/:id", fetchPaymentById);

// Admin routes
router.post("/payments", authenticate, checkAdmin, createNewPayment);
router.put("/payments/:id", authenticate, checkAdmin, updatePayment);
router.delete("/payments/:id", authenticate, checkAdmin, deletePaymentById);

export default router;










