const express = require("express");
const {
  createUser,
  getAllUsers,
  deleteUser,
  changeUserRole,
} = require("../controllers/userController");
const { authenticate, authorize } = require("../middleware/auth");
const { validateUser } = require("../middleware/validation");

const router = express.Router();

// All user routes require authentication
router.use(authenticate);

// Admin only routes
router.post("/", authorize("admin"), validateUser, createUser);
router.get("/", authorize("admin"), getAllUsers);
router.delete("/:id", authorize("admin"), deleteUser);
router.patch("/:id/role", authorize("admin"), changeUserRole);

module.exports = router;
