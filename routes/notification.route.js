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
import { checkAdmin } from "../middleware/admin.middleware.js";

const router = express.Router();

// Admin routes only
router.get("/notifications", checkAdmin, fetchAllNotifications);
router.get("/notifications/unread-count", checkAdmin, fetchUnreadCount);
router.get("/notifications/:id", checkAdmin, fetchNotificationById);
router.post("/notifications", checkAdmin, createNewNotification);
router.put("/notifications/:id/read", checkAdmin, markNotificationAsRead);
router.put("/notifications/read-all", checkAdmin, markAllNotificationsAsRead);
router.delete("/notifications/:id", checkAdmin, deleteNotificationById);

export default router;









