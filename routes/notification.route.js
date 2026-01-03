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
import { authenticate, checkAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

// Admin routes only
router.get("/notifications", authenticate, checkAdmin, fetchAllNotifications);
router.get("/notifications/unread-count", authenticate, checkAdmin, fetchUnreadCount);
router.get("/notifications/:id", authenticate, checkAdmin, fetchNotificationById);
router.post("/notifications", authenticate, checkAdmin, createNewNotification);
router.put("/notifications/:id/read", authenticate, checkAdmin, markNotificationAsRead);
router.put("/notifications/read-all", authenticate, checkAdmin, markAllNotificationsAsRead);
router.delete("/notifications/:id", authenticate, checkAdmin, deleteNotificationById);

export default router;










