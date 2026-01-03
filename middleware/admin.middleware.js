// This file is kept for backward compatibility
// Use auth.middleware.js for authentication
import { authenticate } from "./auth.middleware.js";

// Export as middleware function for backward compatibility
export const checkAdmin = authenticate;