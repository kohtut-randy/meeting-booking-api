const getBookingPayload = (req) => {
  const body = req.body;

  // If body is already an object with the fields we need
  if (body && typeof body === "object" && !Array.isArray(body)) {
    // Check for direct fields
    if (body.startTime || body.endTime) {
      return body;
    }

    // Check for nested data
    if (body.data && typeof body.data === "object") {
      return body.data;
    }

    // Check for nested payload
    if (body.payload && typeof body.payload === "object") {
      return body.payload;
    }

    // If body has the fields but maybe with different casing
    const normalizedBody = {};
    if (body.startTime) normalizedBody.startTime = body.startTime;
    if (body.endTime) normalizedBody.endTime = body.endTime;
    if (body.start_time) normalizedBody.startTime = body.start_time;
    if (body.end_time) normalizedBody.endTime = body.end_time;

    if (normalizedBody.startTime || normalizedBody.endTime) {
      return normalizedBody;
    }
  }

  // If body is a string, try to parse it
  if (typeof body === "string") {
    try {
      const parsed = JSON.parse(body);
      if (parsed && typeof parsed === "object") {
        return parsed;
      }
    } catch {
      return null;
    }
  }

  // Check query params
  if (
    req.query?.startTime ||
    req.query?.endTime ||
    req.query?.start_time ||
    req.query?.end_time
  ) {
    return {
      startTime: req.query.startTime || req.query.start_time,
      endTime: req.query.endTime || req.query.end_time,
    };
  }

  return null;
};

const validateBooking = (req, res, next) => {
  console.log("Request body:", req.body);
  console.log("Request headers:", req.headers["content-type"]);

  const payload = getBookingPayload(req);

  console.log("Extracted payload:", payload);

  if (!payload || Object.keys(payload).length === 0) {
    return res.status(400).json({
      error: "Request body is empty or invalid",
      message:
        "Send JSON with startTime and endTime. Make sure to set Content-Type: application/json header",
      required: ["startTime", "endTime"],
      received: req.body,
    });
  }

  const startTime = payload.startTime || payload.start_time;
  const endTime = payload.endTime || payload.end_time;

  if (!startTime || !endTime) {
    return res.status(400).json({
      error: "Missing required fields",
      required: ["startTime or start_time", "endTime or end_time"],
      received: payload,
    });
  }

  // Validate date formats
  const startDate = new Date(startTime);
  const endDate = new Date(endTime);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return res.status(400).json({
      error: "Invalid date format",
      startTime,
      endTime,
    });
  }

  // Attach the validated data to the request
  req.bookingInput = {
    startTime: startTime,
    endTime: endTime,
  };

  console.log("Booking input set:", req.bookingInput);

  next();
};

const validateUser = (req, res, next) => {
  const { name, role } = req.body;
  const normalizedName = name?.trim();

  if (!normalizedName || !role) {
    return res.status(400).json({
      error: "Missing required fields",
      required: ["name", "role"],
    });
  }

  req.body.name = normalizedName;

  if (!["admin", "owner", "user"].includes(role)) {
    return res.status(400).json({
      error: "Invalid role. Must be one of: admin, owner, user",
    });
  }

  next();
};

module.exports = {
  validateBooking,
  validateUser,
};
