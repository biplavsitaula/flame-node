import {
  registerUser,
  loginUser,
  getUserById,
  updateUser,
  getAllUsers,
  deleteUser,
  forgotPassword,
  resetPassword,
} from "../services/auth.service.js";

export const register = async (req, res) => {
  try {
    const result = await registerUser(req.body);
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Error registering user",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const result = await loginUser(email, password);
    res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message || "Invalid credentials",
    });
  }
};

export const logout = async (req, res) => {
  try {
    // For JWT-based auth, logout is handled client-side by removing the token
    // This endpoint confirms the logout action on the server
    res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error during logout",
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await getUserById(req.user.userId);
    res.status(200).json({
      success: true,
      message: "Profile fetched successfully",
      data: user,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message || "Error fetching profile",
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { password, ...updateData } = req.body;

    // Don't allow password update through this endpoint
    if (password) {
      return res.status(400).json({
        success: false,
        message: "Use change password endpoint to update password",
      });
    }

    const user = await updateUser(req.user.userId, updateData);
    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: user,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Error updating profile",
    });
  }
};

export const fetchAllUsers = async (req, res) => {
  try {
    const result = await getAllUsers(req.query);
    res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data: result.users,
      pagination: result.pagination,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching users",
    });
  }
};

export const fetchUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await getUserById(id);
    res.status(200).json({
      success: true,
      message: "User fetched successfully",
      data: user,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message || "User not found",
    });
  }
};

export const updateUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await updateUser(id, req.body);
    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: user,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Error updating user",
    });
  }
};

export const deleteUserById = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteUser(id);
    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message || "User not found",
    });
  }
};

/**
 * POST /auth/forgot-password
 * Request password reset
 */
export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const result = await forgotPassword(email);
    
    // Check if there was a rate limit issue
    if (result.rateLimited) {
      return res.status(429).json({
        success: false,
        message: result.message || "Too many requests. Please wait 1 minute before requesting another password reset.",
        rateLimited: true,
      });
    }
    
    res.status(200).json({
      success: true,
      message: result.message || "If an account with that email exists, a password reset link has been sent.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error processing password reset request",
    });
  }
};

/**
 * POST /auth/reset-password
 * Reset password using token
 */
export const resetPasswordController = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Reset token and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const result = await resetPassword(resetToken, newPassword);
    res.status(200).json({
      success: true,
      message: result.message,
      data: {
        user: result.user,
        token: result.token,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Error resetting password",
    });
  }
};



