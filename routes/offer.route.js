import express from "express";
import {
  fetchAllOffers,
  fetchOfferById,
  createNewOffer,
  updateExistingOffer,
  deleteOfferById,
  toggleOfferActiveStatus,
} from "../controller/offer.controller.js";
import { authenticate, checkSuperAdmin, checkAdminViewOnly } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes - anyone can view offers
router.get("/offers", fetchAllOffers);
router.get("/offers/:id", fetchOfferById);

// Protected routes - require authentication
// View routes - admin and super_admin can view
router.get("/offers/admin/all", authenticate, checkAdminViewOnly, fetchAllOffers);

// Modify routes - only super_admin can modify
router.post("/offers", authenticate, checkSuperAdmin, createNewOffer);
router.put("/offers/:id", authenticate, checkSuperAdmin, updateExistingOffer);
router.delete("/offers/:id", authenticate, checkSuperAdmin, deleteOfferById);
router.patch("/offers/:id/toggle", authenticate, checkSuperAdmin, toggleOfferActiveStatus);

export default router;

