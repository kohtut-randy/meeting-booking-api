const User = require("../models/User");
const Booking = require("../models/Booking");

const createUser = async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json({
      message: "User created successfully",
      user,
    });
  } catch (error) {
    if (error.message === "User with this name already exists") {
      return res.status(409).json({ error: error.message });
    }
    console.error("Create user error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Delete all bookings associated with the user (CASCADE will handle this, but we want to return count)
    const deletedBookingsCount = await Booking.deleteByUserId(id);

    // Delete the user
    const deleted = await User.deleteById(id);

    if (!deleted) {
      return res.status(500).json({ error: "Failed to delete user" });
    }

    res.json({
      message: "User deleted successfully",
      deletedUser: user,
      deletedBookingsCount,
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const changeUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !["admin", "owner", "user"].includes(role)) {
      return res.status(400).json({
        error: "Invalid role. Must be one of: admin, owner, user",
      });
    }

    const updatedUser = await User.updateRole(id, role);

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      message: "User role updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Change user role error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  createUser,
  getAllUsers,
  deleteUser,
  changeUserRole,
};
