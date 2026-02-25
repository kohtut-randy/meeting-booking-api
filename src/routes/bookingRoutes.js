const express = require("express");
const {
  createBooking,
  getAllBookings,
  deleteBooking,
  getBookingsGroupedByUser,
  getUsageSummary,
} = require("../controllers/bookingController");
const { authenticate, authorize } = require("../middleware/auth");
const { validateBooking } = require("../middleware/validation");

const router = express.Router();

// All booking routes require authentication
router.use(authenticate);

// Routes accessible by all authenticated users
router.post("/", validateBooking, createBooking);
router.get("/", getAllBookings);
router.delete("/:id", deleteBooking);

// Routes for owners and admins only
router.get(
  "/grouped-by-user",
  authorize("owner", "admin"),
  getBookingsGroupedByUser,
);
router.get("/usage-summary", authorize("owner", "admin"), getUsageSummary);

module.exports = router;
