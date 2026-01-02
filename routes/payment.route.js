import express from "express";
import {
  fetchAllPayments,
  fetchPaymentById,
  fetchPaymentSummary,
  createNewPayment,
  updatePayment,
  deletePaymentById,
} from "../controller/payment.controller.js";
import { checkAdmin } from "../middleware/admin.middleware.js";

const router = express.Router();

// Public routes
router.get("/payments", fetchAllPayments);
router.get("/payments/summary", fetchPaymentSummary);
router.get("/payments/:id", fetchPaymentById);

// Admin routes
router.post("/payments", checkAdmin, createNewPayment);
router.put("/payments/:id", checkAdmin, updatePayment);
router.delete("/payments/:id", checkAdmin, deletePaymentById);

export default router;









