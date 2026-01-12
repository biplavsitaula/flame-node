import express from "express";
import {
  fetchAllPayments,
  fetchPaymentById,
  fetchPaymentSummary,
  createNewPayment,
  updatePayment,
  deletePaymentById,
} from "../controller/payment.controller.js";
import { authenticate, checkSuperAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes
router.get("/payments", fetchAllPayments);
router.get("/payments/summary", fetchPaymentSummary);
router.get("/payments/:id", fetchPaymentById);

// Protected routes - Modify (super_admin only)
router.post("/payments", authenticate, checkSuperAdmin, createNewPayment);
router.put("/payments/:id", authenticate, checkSuperAdmin, updatePayment);
router.delete("/payments/:id", authenticate, checkSuperAdmin, deletePaymentById);

export default router;






