// This file is kept for backward compatibility
// Use auth.middleware.js for authentication and authorization
import { authenticate, checkAdmin as checkAdminAuth } from "./auth.middleware.js";

// Export as middleware function for backward compatibility
export const checkAdmin = (req, res, next) => {
  // Chain authenticate and checkAdminAuth
  authenticate(req, res, (err) => {
    if (err) return next(err);
    checkAdminAuth(req, res, next);
  });
};