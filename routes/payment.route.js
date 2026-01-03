import express from "express";
import {
  fetchAllPayments,
  fetchPaymentById,
  fetchPaymentSummary,
  createNewPayment,
  updatePayment,
  deletePaymentById,
} from "../controller/payment.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes
router.get("/payments", fetchAllPayments);
router.get("/payments/summary", fetchPaymentSummary);
router.get("/payments/:id", fetchPaymentById);

// Protected routes
router.post("/payments", authenticate, createNewPayment);
router.put("/payments/:id", authenticate, updatePayment);
router.delete("/payments/:id", authenticate, deletePaymentById);

export default router;









