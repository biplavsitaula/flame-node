import express from "express";
import {
  fetchAllNotifications,
  fetchNotificationById,
  createNewNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotificationById,
  fetchUnreadCount,
} from "../controller/notification.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

// Protected routes
router.get("/notifications", authenticate, fetchAllNotifications);
router.get("/notifications/unread-count", authenticate, fetchUnreadCount);
router.get("/notifications/:id", authenticate, fetchNotificationById);
router.post("/notifications", authenticate, createNewNotification);
router.put("/notifications/:id/read", authenticate, markNotificationAsRead);
router.put("/notifications/read-all", authenticate, markAllNotificationsAsRead);
router.delete("/notifications/:id", authenticate, deleteNotificationById);

export default router;










