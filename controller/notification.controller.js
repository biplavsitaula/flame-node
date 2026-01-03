import {
  getAllNotifications,
  getNotificationById,
  createNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
} from "../services/notification.service.js";

export const fetchAllNotifications = async (req, res) => {
  try {
    const result = await getAllNotifications(req.query);
    res.status(200).json({
      success: true,
      message: "Notifications fetched successfully",
      data: result.notifications,
      pagination: result.pagination,
      unreadCount: result.unreadCount,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching notifications",
    });
  }
};

export const fetchNotificationById = async (req, res) => {
  const { id } = req.params;
  try {
    const notification = await getNotificationById(id);
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Notification fetched successfully",
      data: notification,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching notification",
    });
  }
};

export const createNewNotification = async (req, res) => {
  try {
    const notification = await createNotification(req.body);
    res.status(201).json({
      success: true,
      message: "Notification created successfully",
      data: notification,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Error creating notification",
    });
  }
};

export const markNotificationAsRead = async (req, res) => {
  const { id } = req.params;
  try {
    const notification = await markAsRead(id);
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Notification marked as read",
      data: notification,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error marking notification as read",
    });
  }
};

export const markAllNotificationsAsRead = async (req, res) => {
  try {
    await markAllAsRead();
    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error marking all notifications as read",
    });
  }
};

export const deleteNotificationById = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedNotification = await deleteNotification(id);
    if (!deletedNotification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error deleting notification",
    });
  }
};

export const fetchUnreadCount = async (req, res) => {
  try {
    const count = await getUnreadCount();
    res.status(200).json({
      success: true,
      message: "Unread count fetched successfully",
      data: { unreadCount: count },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching unread count",
    });
  }
};












