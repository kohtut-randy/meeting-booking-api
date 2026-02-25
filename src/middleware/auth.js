const User = require("../models/User");

const authenticate = async (req, res, next) => {
  try {
    const rawUserName =
      req.headers["x-user-name"] ||
      req.query["x-user-name"] ||
      req.query.xUserName;
    const userName =
      typeof rawUserName === "string" ? rawUserName.trim() : rawUserName;

    if (!userName) {
      return res.status(401).json({
        error:
          "Authentication required. Provide x-user-name header or query param",
      });
    }

    const user = await User.findByName(userName);

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: "Forbidden: Insufficient permissions",
        requiredRoles: roles,
        userRole: req.user.role,
      });
    }

    next();
  };
};

module.exports = {
  authenticate,
  authorize,
};
