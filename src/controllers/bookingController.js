const Booking = require("../models/Booking");
const User = require("../models/User");
const BookingService = require("../services/bookingService");

const createBooking = async (req, res) => {
  try {
    console.log("Create booking - req.bookingInput:", req.bookingInput);
    console.log("Create booking - req.user:", req.user);

    // Use the validated input from middleware
    if (
      !req.bookingInput ||
      !req.bookingInput.startTime ||
      !req.bookingInput.endTime
    ) {
      return res.status(400).json({
        error: "Missing booking input",
        message: "Validation middleware failed to process input",
      });
    }

    const { startTime, endTime } = req.bookingInput;
    const userId = req.user.id;

    console.log("Creating booking with:", { userId, startTime, endTime });

    // Validate booking times
    const validation = Booking.validateBookingTimes(startTime, endTime);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    // Check for overlaps
    const hasOverlap = await Booking.checkOverlap(startTime, endTime);
    if (hasOverlap) {
      return res.status(409).json({
        error: "Booking conflicts with existing booking",
        message: "The requested time slot is already booked",
      });
    }

    // Create booking
    const booking = await Booking.create({
      user_id: userId,
      startTime,
      endTime,
    });

    res.status(201).json({
      message: "Booking created successfully",
      booking,
    });
  } catch (error) {
    console.error("Create booking error:", error);

    if (error.code === "23505") {
      return res.status(409).json({
        error: "Duplicate key",
        message: "Booking with the same id already exists",
      });
    }

    if (error.code === "23503") {
      return res.status(400).json({
        error: "Invalid reference",
        message: "Provided user_id does not exist",
      });
    }

    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
};

const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll();
    res.json(bookings);
  } catch (error) {
    console.error("Get all bookings error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // Check permissions
    const user = req.user;
    const canDelete =
      user.role === "admin" ||
      user.role === "owner" ||
      (user.role === "user" && booking.user_id === user.id); // Changed from user_id to userId

    if (!canDelete) {
      return res.status(403).json({
        error: "Forbidden: You can only delete your own bookings",
      });
    }

    const deleted = await Booking.deleteById(id);

    if (!deleted) {
      return res.status(500).json({ error: "Failed to delete booking" });
    }

    res.json({
      message: "Booking deleted successfully",
      deletedBooking: booking,
    });
  } catch (error) {
    console.error("Delete booking error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getBookingsGroupedByUser = async (req, res) => {
  try {
    const grouped = await BookingService.getBookingsGroupedByUser();
    res.json(grouped);
  } catch (error) {
    console.error("Get grouped bookings error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getUsageSummary = async (req, res) => {
  try {
    const summary = await BookingService.getUsageSummary();
    res.json(summary);
  } catch (error) {
    console.error("Get usage summary error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  createBooking,
  getAllBookings,
  deleteBooking,
  getBookingsGroupedByUser,
  getUsageSummary,
};
