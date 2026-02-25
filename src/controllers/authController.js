const User = require("../models/User");

const login = async (req, res) => {
  try {
    const { name } = req.body;
    const normalizedName = typeof name === "string" ? name.trim() : "";

    console.log("Login attempt with name:", normalizedName);

    if (!normalizedName) {
      return res.status(400).json({ error: "Name is required" });
    }

    const user = await User.findByName(normalizedName);

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    res.json({
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  login,
};
