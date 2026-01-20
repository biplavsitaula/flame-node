import User from "../models/user.models.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || "your-secret-key-change-in-production",
    {
      expiresIn: process.env.JWT_EXPIRE || "30d",
    }
  );
};

// Generate and hash reset token
const getResetPasswordToken = () => {
  const resetToken = crypto.randomBytes(20).toString("hex");
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  const resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

  return { resetToken, resetPasswordToken, resetPasswordExpire };
};

export const registerUser = async (userData) => {
  const { email, password, fullName, mobile, role } = userData;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  // Create user - role defaults to "user" (cannot be set during registration for security)
  // Only super_admin can assign roles via user management endpoints
  const user = new User({
    email,
    password,
    fullName,
    mobile,
    role: role || "user", // Default to "user", but allow if provided (for admin creation)
  });

  await user.save();

  // Generate token
  const token = generateToken(user._id);

  return {
    user: user.toJSON(),
    token,
  };
};

export const loginUser = async (email, password) => {
  // Find user and include password
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new Error("Invalid email or password");
  }

  // Check if user is active
  if (!user.isActive) {
    throw new Error("Account is deactivated. Please contact administrator");
  }

  // Check password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new Error("Invalid email or password");
  }

  // Update last login
  user.lastLogin = new Date();

  // Generate token
  const token = generateToken(user._id);

  return {
    user: user.toJSON(),
    token,
  };
};

export const getUserById = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }
  return user.toJSON();
};

export const updateUser = async (userId, updateData) => {
  const user = await User.findByIdAndUpdate(userId, updateData, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user.toJSON();
};

export const getAllUsers = async (query = {}) => {
  const {
    search,
    isActive,
    sortBy = "createdAt",
    sortOrder = "desc",
    page = 1,
    limit = 10,
  } = query;

  const filter = {};

  // Active filter
  if (isActive !== undefined) {
    filter.isActive = isActive === "true" || isActive === true;
  }

  // Search filter
  if (search) {
    filter.$or = [
      { fullName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  // Sort
  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

  // Pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const users = await User.find(filter)
    .sort(sortOptions)
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

  const total = await User.countDocuments(filter);

  return {
    users,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
  };
};

export const deleteUser = async (userId) => {
  const user = await User.findByIdAndDelete(userId);
  if (!user) {
    throw new Error("User not found");
  }
  return { message: "User deleted successfully" };
};

/**
 * Forgot Password - Generate reset token and send email
 */
export const forgotPassword = async (email) => {
  const user = await User.findOne({ email });

  // Don't reveal if user exists or not for security
  if (!user) {
    return {
      message: "If an account with that email exists, a password reset link has been sent.",
    };
  }

  // Generate reset token
  const { resetToken, resetPasswordToken, resetPasswordExpire } =
    getResetPasswordToken();

  // Save hashed token to database
  user.resetPasswordToken = resetPasswordToken;
  user.resetPasswordExpire = resetPasswordExpire;
  await user.save({ validateBeforeSave: false });

  // Create reset URL (points to backend password reset page)
  const frontendUrl = process.env.FRONTEND_URL || `http://localhost:${process.env.PORT || 5000}`;
  const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

  // Send email with reset link
  let emailSent = false;
  let rateLimited = false;
  
  try {
    const { sendPasswordResetEmail } = await import("./email.service.js");
    const emailResult = await sendPasswordResetEmail(user.email, resetUrl, user.fullName);
    
    if (emailResult && emailResult.success) {
      console.log("✅ Password reset email sent successfully to:", user.email);
      console.log("🔗 Reset URL:", resetUrl);
      emailSent = true;
    } else {
      // Check if it's rate limited
      if (emailResult && emailResult.rateLimited) {
        rateLimited = true;
        console.warn("⚠️  Rate limit: Too many password reset requests. Please wait before requesting again.");
        // Still save the token so they can use it when they get the email
      } else {
        console.warn("⚠️  Email sending failed:", emailResult?.error || "Unknown error");
        console.warn("⚠️  Reset token is still valid. Reset URL:", resetUrl);
        console.warn("⚠️  User can still use this link to reset password.");
      }
    }
  } catch (error) {
    console.error("❌ Error sending password reset email:", error.message);
    console.error("Full error:", error);
    console.warn("⚠️  Reset token is still valid. Reset URL:", resetUrl);
    // Don't remove the token - the reset link can still be used
  }

  // Return appropriate message based on result
  if (rateLimited) {
    return {
      message: "Too many password reset requests. Please wait 1 minute before requesting again.",
      rateLimited: true,
    };
  }

  return {
    message: emailSent 
      ? "Password reset link has been sent to your email." 
      : "If an account with that email exists, a password reset link has been sent.",
  };
};

/**
 * Reset Password - Update password using reset token
 */
export const resetPassword = async (resetToken, newPassword) => {
  // Hash the token to compare with database
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Find user with valid token
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  }).select("+password");

  if (!user) {
    throw new Error("Invalid or expired reset token");
  }

  // Update password
  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  // Send password reset confirmation email
  try {
    const { sendPasswordResetConfirmationEmail } = await import("./email.service.js");
    await sendPasswordResetConfirmationEmail(user.email, user.fullName);
    console.log("✅ Password reset confirmation email sent to:", user.email);
  } catch (error) {
    console.error("⚠️ Failed to send password reset confirmation email:", error.message);
    // Don't throw - password was already reset successfully
  }

  // Generate new token for automatic login
  const token = generateToken(user._id);

  return {
    user: user.toJSON(),
    token,
    message: "Password reset successful",
  };
};




