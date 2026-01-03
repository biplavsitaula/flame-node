// This file is kept for backward compatibility
// Use auth.middleware.js for authentication and authorization
import { checkAdmin as checkAdminAuth } from "./auth.middleware.js";

// Export as middleware function for backward compatibility
// IMPORTANT: This middleware assumes authenticate has already been called
// In routes, use: [authenticate, checkAdmin] or update routes to use authenticate + checkAdmin separately
export const checkAdmin = async (req, res, next) => {
  // Check if user is authenticated (should be set by authenticate middleware)
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required. Please login first.",
    });
  }

  // User is authenticated, now check if they're admin
  return checkAdminAuth(req, res, next);
};