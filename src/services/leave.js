const LeaveApplication = require("../models/leaveApplication");
const Attendance = require("../models/attendance");
const User = require("../models/user");

const createLeave = async (req, res) => {
  try {
    const userId = req.user._id;
    const { reason, startDate, endDate, appliedDate } = req.body;

    if (!userId || !reason || !startDate || !endDate || !appliedDate) {
      return { status: 400, message: "All fields are required." };
    }

    const user = await User.findById(userId);
    if (!user) {
      return { status: 404, message: "User not found." };
    }

    // Create leave application
    let leaveApplication;
    if (user.role === "manager") {
      leaveApplication = new LeaveApplication({
        userId,
        reason,
        startDate,
        endDate,
        appliedDate,
      });
    } else if (user.role === "employee") {
      leaveApplication = new LeaveApplication({
        userId,
        reason,
        startDate,
        endDate,
        appliedDate,
        parentApproval: {
          approved: false,
          approvedBy: user.parentId,
        },
      });
    } else if (user.role === "labour") {
      leaveApplication = new LeaveApplication({
        userId,
        reason,
        startDate,
        endDate,
        appliedDate,
        parentApproval: {
          approved: false,
          approvedBy: user.parentId,
        },
        grandparentApproval: {
          approved: false,
          approvedBy: user.grandParentId,
        },
      });
    } else {
      return { status: 400, message: "Invalid user role." };
    }

    const leave = await leaveApplication.save();
    if (!leave) {
      return { status: 400, message: "Leave application creation failed." };
    }
    return {
      status: 201,
      message: "Leave application created successfully.",
      leave: leaveApplication,
    };
  } catch (error) {
    return { status: 500, message: error.message };
  }
};

// Get all leave applications for logged in user
const getLeaves = async (req) => {
  try {
    const userId = req.user._id;
    if (!userId) {
      return { status: 400, message: "User ID is required." };
    }

    const leaves = await LeaveApplication.find({ userId });
    if (!leaves) {
      return { status: 404, message: "No leaves found." };
    }
    return { status: 200, message: "Leaves fetched successfully.", leaves };
  } catch (error) {
    return { status: 500, message: error.message };
  }
};

// Get all leave applications (admin,hr,employee view)
const getAllLeaves = async (req) => {
  try {
    const userId = req.user._id;
    const query = {
      $or: [
        { "parentApproval.approvedBy": userId },
        { "grandparentApproval.approvedBy": userId },
      ],
    };

    const leaves = await LeaveApplication.find(query);
    if (!leaves || leaves.length === 0) {
      return { status: 404, message: "No leaves found.", leaves: [] };
    }
    return { status: 200, message: "All leaves fetched successfully.", leaves };
  } catch (error) {
    return { status: 500, message: error.message };
  }
};

const updateLeave = async (req) => {
  try {
    const { leaveId } = req.params;
    const { approval } = req.body; // Only the approval field (true or false)

    const userId = req.user._id;

    if (approval === undefined) {
      return { status: 400, message: "Approval field is required." };
    }

    if (!leaveId) {
      return { status: 400, message: "Leave ID is required." };
    }

    const leave = await LeaveApplication.findById(leaveId);
    if (!leave) {
      return { status: 404, message: "Leave application not found." };
    }

    // Check if the user is admin, parent, or grandparent
    let updated = false;

    // Admin check: Admins can approve or reject without restrictions
    if (req.user.role === "admin") {
      leave.adminApproval = {
        approved: approval,
        approvedBy: userId,
        approvedDate: new Date(),
      };
      updated = true;
    } 
    // Parent approval check
    else if (leave.parentApproval?.approvedBy?.equals(userId)) {
      leave.parentApproval = {
        approved: approval,
        approvedBy: userId,
        approvedDate: new Date(),
      };
      updated = true;
    } 
    // Grandparent approval check
    else if (leave.grandparentApproval?.approvedBy?.equals(userId)) {
      leave.grandparentApproval = {
        approved: approval,
        approvedBy: userId,
        approvedDate: new Date(),
      };
      updated = true;
    }

    if (!updated) {
      return {
        status: 403,
        message: "You are not authorized to approve this leave.",
      };
    }

    // Update reviewedBy to the user who last updated the application
    leave.reviewedBy = userId;
    if (approval === false) {
      leave.status = "rejected";
    } else if (leave.adminApproval?.approved) {
      leave.status = "approved";

      // Update attendance for approved leave
      const { startDate, endDate } = leave;
      const start = new Date(startDate);
      const end = new Date(endDate);

      for (let date = start; date <= end; date.setDate(date.getDate() + 1)) {
        const formattedDate = new Date(date).toISOString();
        await Attendance.updateOne(
          {
            userId: leave.userId,
            "dates.date": formattedDate,
          },
          {
            $set: {
              "dates.$.status": "leave",
            },
          },
          { upsert: true }
        ).catch(async () => {
          // If no match found, push the date
          await Attendance.updateOne(
            { userId: leave.userId },
            {
              $push: {
                dates: { date: formattedDate, status: "leave" },
              },
            },
            { upsert: true }
          );
        });
      }
    } else{ 
      leave.status = "pending";
    }

    // Save the updated leave application
    await leave.save();

    return {
      status: 200,
      message: "Leave application updated successfully.",
      leave,
    };
  } catch (error) {
    return { status: 500, message: error.message };
  }
};

module.exports = {
  createLeave,
  getLeaves,
  getAllLeaves,
  updateLeave,
};
