const bcryptjs = require("bcryptjs");
const User = require("../models/user");
const jwt = require("jsonwebtoken");

const signup = async (req) => {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      picture,
      role,
      mobile,
      department,
      dateOfJoining,
      status,
      address,
      dateOfBirth,
      gender,
    } = req.body;

    // Validate required fields
    if (
      !email ||
      !password ||
      !firstName ||
      !lastName ||
      !role ||
      !mobile ||
      !department ||
      !dateOfJoining ||
      !address ||
      !dateOfBirth ||
      !gender
    ) {
      return { status: 400, message: "All fields are required" };
    }

    // Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return { status: 400, message: "User already exists" };
    }

    // Hash password and create new user
    const hashedPassword = await bcryptjs.hash(password, 12);
    const user = await User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      picture,
      role,
      mobile,
      department,
      dateOfJoining,
      status,
      address,
      dateOfBirth,
      gender,
    });

    return { status: 201, message: "User created successfully", user };
  } catch (error) {
    return { status: 500, message: error.message };
  }
};

const login = async (req) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return { status: 400, message: "Email and password are required" };
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return { status: 404, message: "User not found" };
    }

    // Validate password
    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      return { status: 401, message: "Invalid password" };
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // Update auth key in user record
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { authKey: token },
      { new: true }
    );
    if (!updatedUser) {
      return { status: 500, message: "Authentication failed" };
    }

    return {
      status: 200,
      message: "User logged in successfully",
      token,
    };
  } catch (error) {
    return { status: 500, message: error.message };
  }
};

module.exports = { signup, login };
