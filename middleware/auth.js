require("dotenv").config();
const jwt = require("jsonwebtoken");
const User = require("../src/models/user");

// Middleware for handling auth
async function auth(req, res, next) {
  try {
    const tokenHead = req.headers["authorization"];

    if (!tokenHead) {
      return res.status(401).json({ message: "User is not logged in" });
    }
    const token = tokenHead.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "User is not logged in" });
    }
    const jwtPassword = process.env.JWT_SECRET;
    const decode = await jwt.verify(token, jwtPassword);
    const user = await User.findById(decode.id).select(
      "-password -authKey -address"
    );
    if (!user) return res.status(403).json({ msg: "User not found auth" });
    req.user = user;
    next();
  } catch (error) {
    console.log(error);
    return {
      message: error.message || "Internal server error",
      success: false,
    };
  }
}

module.exports = auth;
