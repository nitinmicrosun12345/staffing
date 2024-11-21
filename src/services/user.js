const User = require("../models/user");
const DeletionRequest = require("../models/deletionRequests");
const Attendance = require("../models/attendance");
const bcryptjs = require("bcryptjs");

const getMe = async (req) => {
  try {
    const user = await User.findById(req.user._id).select("-password -authKey");
    if (!user) {
      return {
        status: 404,
        message: "User not found",
      };
    }

    return {
      status: 200,
      message: "User fetched successfully",
      user: user,
    };
  } catch (error) {
    return {
      status: 500,
      message: error.message,
    };
  }
};

const logout = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return {
        status: 404,
        message: "User not found",
      };
    }

    const { date, checkOutTime } = req.body;

    const parsedDate = new Date(date);
    if (isNaN(parsedDate)) {
      return {
        status: 400,
        message: "Invalid date format",
      };
    }

    const attendance = await Attendance.findOneAndUpdate(
      { userId: user._id, "dates.date": parsedDate },
      { $set: { "dates.$.checkOutTime": checkOutTime } },
      { new: true }
    );
    // console.log(`Attendance record for ${parsedDate} and ${date} `);
    


    if (!attendance) {
      return {
        status: 404,
        message: `Attendance record for ${parsedDate} and ${date} date not found`,
      };
    }

    // Remove the authKey from the user
    const authKeyRemoval = await User.findByIdAndUpdate(user._id, {
      authKey: "",
    });

    if (!authKeyRemoval) {
      return {
        status: 500,
        message: "Error logging out",
      };
    }

    // Clear user session and cookie
    req.user = null;
    res.clearCookie("token");

    return {
      status: 200,
      message: "Logged out successfully",
      attendance, // Optionally include the updated attendance record
    };
  } catch (error) {
    return {
      status: 500,
      message: error.message,
    };
  }
};

const getAllUsers = async () => {
  try {
    const users = await User.find();
    if (!users) {
      return {
        status: 404,
        message: "No users found",
      };
    }
    return {
      status: 200,
      message: "All users fetched successfully",
      users: users,
    };
  } catch (error) {
    return {
      status: 500,
      message: error.message,
    };
  }
};

const getUser = async (req) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return {
        status: 400,
        message: "User ID is required",
      };
    }
    const user = await User.findById(userId);
    if (!user) {
      return {
        status: 404,
        message: "User not found",
      };
    }
    return {
      status: 200,
      message: "User fetched successfully",
      user: user,
    };
  } catch (error) {
    if (error.name === "CastError" && error.kind === "ObjectId") {
      return { status: 404, message: "User not found" };
    }
    return {
      status: 500,
      message: error.message,
    };
  }
};

const createUser = async (req) => {
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
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return { status: 400, message: "User already exists" };
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
      gender,
    });
    return {
      status: 201,
      message: "User created successfully",
      user: user,
    };
  } catch (error) {
    return { status: 500, message: error.message };
  }
};

const updateUser = async (req) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return {
        status: 400,
        message: "User ID is required",
      };
    }
    const user = await User.findById(userId);
    if (!user) {
      return {
        status: 404,
        message: "User to be updated not found",
      };
    }

    const updates = req.body;
    const updatedUser = await User.findByIdAndUpdate(userId, updates, {
      new: true,
    });

    return {
      status: 200,
      message: "User updated successfully",
      user: updatedUser,
    };
  } catch (error) {
    if (error.name === "CastError" && error.kind === "ObjectId") {
      return { status: 404, message: "UserId not found" };
    }
    return {
      status: 500,
      message: error.message,
    };
  }
};

const deleteUser = async (req) => {
  try {
    const { requestId } = req.params;
    if (!requestId) {
      return {
        status: 400,
        message: "Request ID is required",
      };
    }
    const deletionRequest = await DeletionRequest.findById(requestId);
    if (!deletionRequest) {
      return {
        status: 404,
        message: "Deletion request not found",
      };
    }
    const userId = deletionRequest.user;
    const user = await User.findById(userId);
    if (!user) {
      return {
        status: 404,
        message: "User to be requested not found",
      };
    }
    await User.findByIdAndDelete(userId);
    return {
      status: 200,
      message: "User deleted successfully",
    };
  } catch (error) {
    if (error.name === "CastError" && error.kind === "ObjectId") {
      return { status: 404, message: "Request not found" };
    }
    return {
      status: 500,
      message: error.message,
    };
  }
};

const requestUserDeletion = async (req) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return {
        status: 400,
        message: "User ID is required",
      };
    }
    const user = await User.findById(userId);
    if (!user) {
      return {
        status: 404,
        message: "User requested to be deleted not found",
      };
    }
    const existingRequest = await DeletionRequest.findOne({ user: userId });
    if (existingRequest) {
      return {
        status: 400,
        message: "Deletion request already exists",
      };
    }
    const deletionRequest = await DeletionRequest.create({
      userId: userId,
      requestBy: req.user._id,
    });
    return {
      status: 201,
      message: "User deletion requested successfully",
      deletionRequest: deletionRequest,
    };
  } catch (error) {
    if (error.name === "CastError" && error.kind === "ObjectId") {
      return { status: 404, message: "User not found" };
    }
    return {
      status: 500,
      message: error.message,
    };
  }
};

const getDeletionRequests = async () => {
  try {
    const deletionRequests = await DeletionRequest.find();
    if (!deletionRequests) {
      return {
        status: 404,
        message: "No deletion requests found",
      };
    }
    return {
      status: 200,
      message: "All deletion requests fetched successfully",
      deletionRequests: deletionRequests,
    };
  } catch (error) {
    return {
      status: 500,
      message: error.message,
    };
  }
};

const dashboard = async (req, res) => {
  try {
    const usersCount = (await User.countDocuments()) - 1;
    console.log(usersCount);

    const deletionRequestsCount = await DeletionRequest.countDocuments();
    console.log(deletionRequestsCount);

    const employeesAdded = await User.find({
      dateOfJoining: {
        $gte: new Date(new Date().setDate(new Date().getDate() - 30)),
      },
    }).countDocuments();

    const employeesRemoved = await DeletionRequest.find({
      status: "approved",
    }).countDocuments();
    return {
      status: 200,
      message: "Dashboard data fetched successfully",
      data: {
        usersCount,
        deletionRequestsCount,
        employeesAdded,
        employeesRemoved,
      },
    };
  } catch (error) {
    return {
      status: 500,
      message: error.message,
    };
  }
};

const deleteUserDirect = async (req) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return {
        status: 400,
        message: "User ID is required",
      };
    }
    const user = await User.findById(userId);
    if (!user) {
      return {
        status: 404,
        message: "User to be deleted not found",
      };
    }
    await User.findByIdAndDelete(userId);
    return {
      status: 200,
      message: "User deleted successfully",
    };
  } catch (error) {
    if (error.name === "CastError" && error.kind === "ObjectId") {
      return { status: 404, message: "User to be deleted not found" };
    }
    return {
      status: 500,
      message: error.message,
    };
  }
};


const updateSelf = async (req) => {
  try {
    const user = req.user;
    if (!user) {
      return {
        status: 404,
        message: "User not found",
      };
    }

    const updates = req.body;
    console.log(updates);

    // Update the user in the database
    const updatedUser = await User.findByIdAndUpdate(user._id, updates, {
      new: true, // Return the updated document
    });

    // Corrected the condition
    if (!updatedUser) {
      return {
        status: 500,
        message: "User can't be updated",
      };
    }

    return {
      status: 200,
      message: "User updated successfully",
      user: updatedUser,
    };
  } catch (error) {
    return {
      status: 500,
      message: error.message,
    };
  }
};


module.exports = {
  getMe,
  logout,
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  requestUserDeletion,
  getDeletionRequests,
  dashboard,
  deleteUserDirect,
  updateSelf
};
