import Notification from "../models/notification.models.js";

export const getAllNotifications = async (query = {}) => {
  const {
    type,
    isRead,
    sortBy = "createdAt",
    sortOrder = "desc",
    page = 1,
    limit = 20,
  } = query;

  const filter = {};

  // Type filter
  if (type) {
    filter.type = type;
  }

  // Read status filter
  if (isRead !== undefined) {
    filter.isRead = isRead === "true" || isRead === true;
  }

  // Sort
  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

  // Pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const notifications = await Notification.find(filter)
    .populate("relatedId")
    .sort(sortOptions)
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

  const total = await Notification.countDocuments(filter);
  const unreadCount = await Notification.countDocuments({ isRead: false });

  return {
    notifications,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
    unreadCount,
  };
};

export const getNotificationById = async (id) => {
  return await Notification.findById(id).populate("relatedId").lean();
};

export const createNotification = async (notificationData) => {
  const notification = new Notification(notificationData);
  return await notification.save();
};

export const markAsRead = async (id) => {
  return await Notification.findByIdAndUpdate(
    id,
    { isRead: true },
    { new: true }
  ).lean();
};

export const markAllAsRead = async () => {
  return await Notification.updateMany({ isRead: false }, { isRead: true });
};

export const deleteNotification = async (id) => {
  return await Notification.findByIdAndDelete(id);
};

export const getUnreadCount = async () => {
  return await Notification.countDocuments({ isRead: false });
};












