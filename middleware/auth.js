require("dotenv").config();
const jwt = require("jsonwebtoken");
const User = require("../src/models/user");

// Middleware for handling auth
async function auth(req, res, next) {
  try {
    const tokenHead = req.headers["authorization"];
    console.log("Authorization Header:", tokenHead);

    if (!tokenHead) {
      return res.status(401).json({ message: "User is not logged in" });
    }

    const token = tokenHead.split(" ")[1];
    console.log("Extracted Token:", token);

    if (!token) {
      return res.status(401).json({ message: "User is not logged in" });
    }

    const jwtPassword = process.env.JWT_SECRET;
    const decode = jwt.verify(token, jwtPassword);
    console.log("Decoded Token:", decode);

    const user = await User.findById(decode.id).select("-password -authKey -address");
    if (!user) {
      return res.status(403).json({ message: "User not found" });
    }

    console.log("Authenticated User:", user);
    req.user = user; // Attach user to the request
    next();
  } catch (error) {
    console.error("Authentication Error:", error.message);
    return res.status(500).json({
      message: error.message || "Internal server error",
      success: false,
    });
  }
}


module.exports = auth;
