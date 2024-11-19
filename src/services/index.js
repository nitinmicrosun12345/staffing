const bcryptjs = require("bcryptjs");
const User = require("../models/user");
const jwt = require("jsonwebtoken");

const signup = async (req, res) => {
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
      gender
    } = req.body;
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
      return res.status(400).json({ message: "All fields are required" });
    }
    const existingUser = await User.findOne({ email });
    console.log(existingUser);

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
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
      gender
    });
    res.status(201).json({
      message: "User created successfully",
      user: user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }


    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    const authKeyInsertion = await User.findByIdAndUpdate(
      user._id,
      { authKey: token },
      { new: true }
    );
    if (!authKeyInsertion) {
      return res.status(500).json({ message: "Authentication failed" });
    }

    res.cookie("token", token, { httpOnly: true });

    res.status(200).json({ message:"User logged in successfully", token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { signup, login };
