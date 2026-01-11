import jwt from "jsonwebtoken";
import User from "../models/user.models.js";

// Verify JWT Token
export const authenticate = async (req, res, next) => {
  try {
    let token;

    // Get token from header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. No token provided.",
      });
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key-change-in-production"
    );

    // Get user from token
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Account is deactivated",
      });
    }

    // Attach user to request
    req.user = {
      userId: user._id,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Authentication error",
    });
  }
};

// Check if user is super_admin (can perform CRUD operations)
export const checkSuperAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  // if (req.user.role !== "super_admin") {
  //   return res.status(403).json({
  //     success: false,
  //     message: "Access denied. Super admin privileges required.",
  //   });
  // }

  next();
};

// Check if user is admin or super_admin (can view, but only super_admin can modify)
export const checkAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  if (req.user.role !== "admin" && req.user.role !== "super_admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin privileges required.",
    });
  }

  next();
};

// Check if user is admin (view only, cannot modify)
export const checkAdminViewOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  if (req.user.role !== "admin" && req.user.role !== "super_admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin privileges required.",
    });
  }

  // Allow GET requests for admin, but block POST/PUT/DELETE unless super_admin
  const method = req.method.toUpperCase();
  if (method !== "GET" && req.user.role !== "super_admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Only super admin can perform this action.",
    });
  }

  next();
};

// Check if user has any valid role (super_admin, admin, or user)
export const checkAnyRole = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  const validRoles = ["super_admin", "admin", "user"];
  if (!validRoles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: "Access denied. Invalid user role.",
    });
  }

  next();
};






