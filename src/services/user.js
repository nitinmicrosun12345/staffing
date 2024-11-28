const User = require("../models/user");
const DeletionRequest = require("../models/deletionRequests");
const Attendance = require("../models/attendance");
const bcryptjs = require("bcryptjs");
const mongoose = require("mongoose");

const roleHierarchy = {
  admin: [],
  manager: ["admin"],
  employee: ["admin", "manager"],
  labour: ["admin", "manager", "employee"],
};

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
      { userId: user._id, "dates.date": date },
      { $set: { "dates.$.checkOutTime": checkOutTime } },
      { new: true }
    );

    if (!attendance) {
      return {
        status: 404,
        message: `Attendance record for ${parsedDate} and ${date} date not found`,
      };
    }

    const authKeyRemoval = await User.findByIdAndUpdate(user._id, {
      authKey: "",
    });

    if (!authKeyRemoval) {
      return {
        status: 500,
        message: "Error logging out",
      };
    }

    req.user = null;
    res.clearCookie("token");

    return {
      status: 200,
      message: "Logged out successfully",
      attendance,
    };
  } catch (error) {
    return {
      status: 500,
      message: error.message,
    };
  }
};

const getAllUsers = async (req) => {
  try {
    const { role: userRole, _id: userId } = req.user;
    const { month, year, salaryPerDay } = req.body;

    if (!month || !year) {
      return {
        status: 400,
        message: "Month and Year are required.",
      };
    }

    let query = {};

    // Build query based on user role
    if (userRole === "manager") {
      query = {
        $or: [
          { role: { $in: ["employee", "labour"] }, parentId: userId },
          { role: "labour", grandParentId: userId },
        ],
      };
    } else if (userRole === "employee") {
      query = { role: "labour", parentId: new mongoose.Types.ObjectId(userId) };
    } else if (userRole !== "admin") {
      return {
        status: 401,
        message: "Unauthorized",
      };
    }

    // Fetch users based on the query
    const users = await User.find(query).select("-password -authKey");
    if (!users || users.length === 0) {
      return {
        status: 404,
        message: "No users found.",
      };
    }

    // Calculate working days for each user
    const userWorkingDays = await Promise.all(
      users.map(async (user) => {
        const attendance = await Attendance.findOne({ userId: user._id });

        let totalWorkingDays = 0;
        if (attendance) {
          const userAttendance = attendance.dates;

          userAttendance.forEach((day) => {
            const date = new Date(day.date);
            if (
              date.getMonth() + 1 === parseInt(month) &&
              date.getFullYear() === parseInt(year)
            ) {
              if (day.status === "present") {
                totalWorkingDays++;
              }
            }
          });
        }

        return {
          _id: user._id,
          empId: user.empId,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          department: user.department,
          status: user.status,
          dateOfJoining: user.dateOfJoining,
          totalWorkingDays,
          totalSalary: totalWorkingDays * salaryPerDay,
        };
      })
    );

    return {
      status: 200,
      message: "Users with working days fetched successfully.",
      users: userWorkingDays,
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

    const userRole = req.user.role;
    const user = await User.findById(userId).select("-password -authKey");
    if (!user) {
      return {
        status: 404,
        message: "User not found",
      };
    }

    // Admin can access any user
    if (userRole === "admin") {
      return {
        status: 200,
        message: "User fetched successfully",
        user: user,
      };
    }

    // Managers can access employees and labours
    if (userRole === "manager" && ["employee", "labour"].includes(user.role)) {
      return {
        status: 200,
        message: "User fetched successfully",
        user: user,
      };
    }

    // Employees can access only labours
    if (userRole === "employee" && user.role === "labour") {
      return {
        status: 200,
        message: "User fetched successfully",
        user: user,
      };
    }

    // Labours cannot access any user
    if (userRole === "labour") {
      return {
        status: 401,
        message: "Unauthorized",
      };
    }

    return {
      status: 401,
      message: "Unauthorized",
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

    if (!roleHierarchy[role].includes(req.user.role)) {
      return { status: 400, message: `Unauthorized to create ${role}` };
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return { status: 400, message: "User already exists" };
    }

    const hashedPassword = await bcryptjs.hash(password, 12);

    const newUser = {
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
      parentId: req.user._id,
    };

    if (req.user.role === "employee") {
      newUser.grandParentId = req.user.parentId;
    }

    const user = await User.create(newUser);

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

    const userRole = req.user.role;
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

const deleteUserViaRequest = async (req) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body;

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

    const userId = deletionRequest.userId;
    const user = await User.findById(userId);
    if (!user) {
      return {
        status: 404,
        message: "User to be deleted not found",
      };
    }

    if (status === "approved") {
      await User.findByIdAndDelete(userId);
      deletionRequest.status = "approved";
    } else if (status === "rejected") {
      deletionRequest.status = "rejected";
    } else {
      deletionRequest.status = "pending";
    }

    await deletionRequest.save();

    return {
      status: 200,
      message: `Deletion request ${status} successfully`,
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

    // Validate User ID
    if (!userId) {
      return {
        status: 400,
        message: "User ID is required",
      };
    }

    // Fetch the user to be deleted
    const user = await User.findById(userId);
    if (!user) {
      return {
        status: 404,
        message: "User requested to be deleted not found",
      };
    }

    // Fetch the requesting user's role and validate permissions
    const requestorRole = req.user.role;

    const roleHierarchy = {
      admin: ["manager", "employee", "labour"],
      manager: ["employee", "labour"],
      employee: ["labour"],
      labour: [],
    };

    // Check if the requestor has permission to request deletion of the target user
    if (!roleHierarchy[requestorRole]?.includes(user.role)) {
      return {
        status: 401,
        message: "Unauthorized to request deletion for this user",
      };
    }

    // Check for existing deletion requests for the user
    const existingRequest = await DeletionRequest.findOne({ userId: userId });
    if (existingRequest) {
      return {
        status: 400,
        message: "Deletion request already exists",
      };
    }

    // Create a new deletion request
    const deletionRequest = await DeletionRequest.create({
      userId: userId,
      requestBy: req.user._id,
    });

    return {
      status: 201,
      message: "User deletion requested successfully",
      deletionRequest,
    };
  } catch (error) {
    // Handle specific errors like invalid ObjectId
    if (error.name === "CastError" && error.kind === "ObjectId") {
      return { status: 404, message: "User not found" };
    }

    // General error handling
    return {
      status: 500,
      message: error.message,
    };
  }
};

const getDeletionRequests = async (req) => {
  try {
    const userRole = req.user.role;
    let query = {};

    if (userRole !== "admin") {
      query = { requestBy: req.user._id };
    }

    const deletionRequests = await DeletionRequest.find(query)
      .populate("userId", "email")
      .populate("requestBy", "email");

    if (!deletionRequests || deletionRequests.length === 0) {
      return {
        status: 404,
        message: "No deletion requests found",
      };
    }

    return {
      status: 200,
      message: "Deletion requests fetched successfully",
      deletionRequests,
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
    const { role, _id } = req.user; // Get role and user ID from request user
    let usersCountQuery = {};

    // Adjust `usersCount` query based on role
    if (role === "admin") {
      // Exclude admins from the count
      usersCountQuery = { role: { $ne: "admin" } };
    } else if (role === "manager") {
      // Include only employees and labours for managers
      usersCountQuery = {
        $or: [
          { role: { $in: ["employee", "labour"] }, parentId: _id },
          { role: "labour", grandParentId: _id },
        ],
      };
    } else if (role === "employee") {
      // Include only labours and any "child" users under the employee
      usersCountQuery = { role: "labour", parentId: _id };
    }

    const usersCount = await User.countDocuments(usersCountQuery);

    const deletionRequestsCount = await DeletionRequest.countDocuments();

    let employeesAddedQuery = {
      dateOfJoining: {
        $gte: new Date(new Date().setDate(new Date().getDate() - 30)),
      },
    };

    // Adjust `employeesAdded` query for roles
    if (role === "manager") {
      employeesAddedQuery = {
        $or: [
          { role: { $in: ["employee", "labour"] }, parentId: _id },
          { role: "labour", grandParentId: _id },
        ],
      };
    } else if (role === "employee") {
      employeesAddedQuery = { role: "labour", parentId: _id };
    }

    const employeesAdded = await User.countDocuments(employeesAddedQuery);

    let employeesRemovedQuery = { status: "approved" };

    // Adjust `employeesRemoved` query for roles
    if (role === "manager") {
      employeesRemovedQuery = {
        $or: [
          { role: { $in: ["employee", "labour"] }, parentId: _id },
          { role: "labour", grandParentId: _id },
        ],
        requestedBy: _id,
      };
    } else if (role === "employee") {
      employeesRemovedQuery = {
        role: "labour",
        parentId: _id,
        requestedBy: _id,
      };
    }

    const employeesRemoved = await DeletionRequest.countDocuments(
      employeesRemovedQuery
    );

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
    return res.status(500).json({
      status: 500,
      message: error.message,
    });
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

    const updatedUser = await User.findByIdAndUpdate(user._id, updates, {
      new: true,
    });

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

const monthlySalary = async (req, res) => {
  try {
    const { userId } = req.params;
    const { month, year, salaryPerDay } = req.body;
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
    const attendance = await Attendance.findOne({ userId: userId });
    if (!attendance) {
      return {
        status: 404,
        message: "Attendance not found",
      };
    }

    let totalWorkingDays = 0;
    const userAttendance = attendance.dates;
    userAttendance.forEach((day) => {
      const date = new Date(day.date);
      if (date.getMonth() + 1 === month && date.getFullYear() === year) {
        totalWorkingDays++;
      }
    });

    const totalSalary = totalWorkingDays * salaryPerDay;

    return {
      status: 200,
      message: "Monthly salary calculated successfully",
      data: {
        totalWorkingDays,
        totalSalary,
      },
    };
  } catch (error) {
    return {
      status: 500,
      message: error.message,
    };
  }
};

const picture = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return {
        status: 404,
        message: "User not found",
      };
    }

    const picture = req.file ? req.file.path : null;
    if (!picture) {
      return {
        status: 400,
        message: "Picture upload failed",
      };
    }

    // Update the user's profile with the picture URL
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { picture },
      { new: true }
    );

    if (!updatedUser) {
      return {
        status: 500,
        message: "User update failed",
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
  deleteUserViaRequest,
  requestUserDeletion,
  getDeletionRequests,
  dashboard,
  deleteUserDirect,
  updateSelf,
  monthlySalary,
  picture,
};
