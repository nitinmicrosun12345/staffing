const User = require("../models/user");
const DeletionRequest = require("../models/deletionRequests");
const bcryptjs = require("bcryptjs");

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    if (!users) {
      return res.status(404).json({
        message: "No user found",
      });
    }
    res.status(200).json({
      message: "All users fetched successfully",
      users: users,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: error.message,
    });
  }
};

const getUser = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({
        message: "User ID is required",
      });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    res.status(200).json({
      message: "User fetched successfully",
      user: user,
    });
  } catch (error) {
    if (error.name === "CastError" && error.kind === "ObjectId") {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(500).json({
      message: error.message,
    });
  }
};

const createUser = async (req, res) => {
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
      !address
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const existingUser = await User.findOne({ email });
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
    });
    res.status(201).json({
      message: "User created successfully",
      user: user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({
        message: "User ID is required",
      });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const updates = req.body;
    const updatedUser = await User.findByIdAndUpdate(userId, updates, {
      new: true,
    });

    res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    if (error.name === "CastError" && error.kind === "ObjectId") {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(500).json({
      message: error.message,
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { requestId } = req.params;
    if (!requestId) {
      return res.status(400).json({
        message: "User ID is required",
      });
    }
    const deletionRequest = await DeletionRequest.findById(requestId);
    if (!deletionRequest) {
      return res.status(404).json({
        message: "Deletion request not found",
      });
    }
    const userId = deletionRequest.user;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    await User.findByIdAndDelete(userId);
    res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (error) {
    if (error.name === "CastError" && error.kind === "ObjectId") {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(500).json({
      message: error.message,
    });
  }
};

const requestUserDeletion = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({
        message: "User ID is required",
      });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    const existingRequest = await DeletionRequest.findOne({ user: userId });
    if (existingRequest) {
      return res.status(400).json({
        message: "Deletion request already exists",
      });
    }
    const deletionRequest = await DeletionRequest.create({
      userId: userId,
      requestBy: req.user._id,
    });
    if (!deletionRequest) {
      return res.status(500).json({
        message: "Deletion request failed",
      });
    }
    res.status(201).json({
      message: "User deletion requested successfully",
      deletionRequest: deletionRequest,
    });
  } catch (error) {
    if (error.name === "CastError" && error.kind === "ObjectId") {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(500).json({
      message: error.message,
    });
  }
};

const getDeletionRequests = async (req, res) => {
  try {
    const deletionRequests = await DeletionRequest.find();
    if (!deletionRequests) {
      return res.status(404).json({
        message: "No deletion requests found",
      });
    }
    res.status(200).json({
      message: "All deletion requests fetched successfully",
      deletionRequests: deletionRequests,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: error.message,
    });
  }
}

module.exports = {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  requestUserDeletion,
  getDeletionRequests,
};
