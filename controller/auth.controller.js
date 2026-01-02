import {
  registerUser,
  loginUser,
  getUserById,
  updateUser,
  getAllUsers,
  deleteUser,
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
    const { password, role, ...updateData } = req.body;

    // Don't allow password or role update through this endpoint
    if (password) {
      return res.status(400).json({
        success: false,
        message: "Use change password endpoint to update password",
      });
    }

    if (role) {
      return res.status(403).json({
        success: false,
        message: "You cannot change your role",
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


