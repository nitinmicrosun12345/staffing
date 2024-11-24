const User = require("../models/user");
const Attendance = require("../models/attendance");

const addAttendance = async (req) => {
  try {
    let { date, checkInTime, latitude, longitude } = req.body;

    // Convert date to IST
    date = new Date(date);
    // const istOffset = 5 * 60 + 30; // IST is UTC +5:30
    // const utcDate = new Date(
    //   originalDate.getTime() + originalDate.getTimezoneOffset() * 60000
    // );
    // const istDate = new Date(utcDate.getTime() + istOffset * 60000);

    const userId = req.user._id;

    // Find the attendance record for the user
    const attendanceRecord = await Attendance.findOne({ userId });

    if (attendanceRecord) {
      // Check if attendance for the same date already exists
      const dateExists = attendanceRecord.dates.some(
        (d) => new Date(d.date).toDateString() === date.toDateString()
      );

      if (dateExists) {
        return { status: 400, message: "Attendance already marked for today" };
      }

      attendanceRecord.dates.push({
        date: date,
        status: "present",
        checkInTime,
        latitude,
        longitude,
      });

      const updatedAttendance = await attendanceRecord.save();
      if (!updatedAttendance) {
        return { status: 500, message: "Error in saving attendance" };
      }

      return {
        status: 201,
        message: `Attendance marked successfully`,
        attendance: updatedAttendance,
      };
    }

    // If no record exists, create a new document
    const newAttendance = new Attendance({
      userId,
      dates: [
        {
          date: date,
          status: "present",
          checkInTime,
          latitude,
          longitude,
        },
      ],
    });

    const savedAttendance = await newAttendance.save();
    if (!savedAttendance) {
      return { status: 500, message: "Error in saving attendance" };
    }

    return {
      status: 201,
      message: `Attendance marked successfully`,
      attendance: savedAttendance,
    };
  } catch (error) {
    console.error(error);
    return { status: 500, message: error.message };
  }
};

// const viewAllAttendance = async (req) => {
//   try {
//     const { date, status } = req.body;

//     if (!date) {
//       return { status: 400, message: "Date is required" };
//     }

//     // Normalize input date to start of the day
//     const inputDate = new Date(date).toDateString();

//     // Fetch all users
//     const users = await User.find(
//       {},
//       "firstName lastName role department empId"
//     );

//     // Fetch attendance records for the specific date
//     const attendanceRecords = await Attendance.find({
//       dates: {
//         $elemMatch: {
//           date: {
//             $gte: new Date(inputDate),
//             $lt: new Date(new Date(inputDate).getTime() + 24 * 60 * 60 * 1000), // Next day's 12:00 AM
//           },
//         },
//       },
//     });

//     // Map attendance records by userId for quick lookup
//     const attendanceMap = attendanceRecords.reduce((acc, record) => {
//       const filteredDates = record.dates.filter(
//         (d) =>
//           new Date(d.date).toDateString() === inputDate &&
//           (!status || d.status === status)
//       );
//       if (filteredDates.length > 0) {
//         acc[record.userId.toString()] = {
//           ...record._doc,
//           dates: filteredDates,
//         };
//       }
//       return acc;
//     }, {});

//     // Prepare the final list combining attendance and absent users
//     const finalAttendance = users.map((user) => {
//       const attendance = attendanceMap[user._id.toString()];
//       if (attendance) {
//         return {
//           userId: user._id,
//           firstName: user.firstName,
//           lastName: user.lastName,
//           role: user.role,
//           department: user.department,
//           dates: attendance.dates,
//           empId: user.empId,
//         };
//       } else {
//         return {
//           userId: user._id,
//           firstName: user.firstName,
//           lastName: user.lastName,
//           role: user.role,
//           department: user.department,
//           empId: user.empId,
//           dates: [
//             {
//               date: new Date(inputDate),
//               status: "absent",
//               checkInTime: null,
//               checkOutTime: null,
//               latitude: null,
//               longitude: null,
//             },
//           ],
//         };
//       }
//     });

//     return {
//       status: 200,
//       message: "Attendance fetched successfully",
//       attendances: finalAttendance,
//     };
//   } catch (error) {
//     return {
//       status: 500,
//       message: error.message,
//       attendances: null,
//     };
//   }
// };

const viewAllAttendance = async (req) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;
    const { date, status } = req.body;

    if (!userRole) {
      return { status: 404, message: "User not found" };
    }

    let usersQuery = {};

    if (userRole === "admin") {
      usersQuery = { role: { $ne: "admin" } };
    } else if (userRole === "manager") {
      usersQuery = {
        $or: [
          { role: { $in: ["employee", "labour"] }, parentId: userId },
          { role: "labour", grandParentId: userId },
        ],
      }
    } else if (userRole === "employee") {
      usersQuery = { parentId: userId };
    } else {
      return { status: 403, message: "Access denied" };
    }

    const users = await User.find(usersQuery, "firstName lastName role department empId");

    const inputDate = date ? new Date(date).toDateString() : null;

    const attendanceRecords = await Attendance.find({
      userId: { $in: users.map((user) => user._id) },
      ...(inputDate && {
        dates: {
          $elemMatch: {
            date: {
              $gte: new Date(inputDate),
              $lt: new Date(new Date(inputDate).getTime() + 24 * 60 * 60 * 1000),
            },
          },
        },
      }),
    });

    const attendanceMap = attendanceRecords.reduce((acc, record) => {
      const filteredDates = record.dates.filter(
        (d) =>
          (!inputDate || new Date(d.date).toDateString() === inputDate) &&
          (!status || d.status === status)
      );
      if (filteredDates.length > 0) {
        acc[record.userId.toString()] = {
          ...record._doc,
          dates: filteredDates,
        };
      }
      return acc;
    }, {});

    const finalAttendance = users.map((user) => {
      const attendance = attendanceMap[user._id.toString()];
      if (attendance) {
        return {
          userId: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          department: user.department,
          dates: attendance.dates,
          empId: user.empId,
        };
      } else {
        return {
          userId: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          department: user.department,
          empId: user.empId,
          dates: [
            {
              date: new Date(inputDate),
              status: "absent",
              checkInTime: null,
              checkOutTime: null,
              latitude: null,
              longitude: null,
            },
          ],
        };
      }
    });

    return {
      status: 200,
      message: "Attendance fetched successfully",
      attendances: finalAttendance,
    };
  } catch (error) {
    return { status: 500, message: error.message };
  }
};

const myAttendance = async (req) => {
  try {
    const userId = req.user._id;
    const { date, status } = req.body;

    // Find attendance record for the user
    const attendanceRecord = await Attendance.findOne({ userId });
    if (!attendanceRecord) {
      return { status: 404, message: "Attendance not found" };
    }

    let filteredAttendance = attendanceRecord.dates;

    // Filter by date if provided
    if (date) {
      const inputDate = new Date(date).toDateString();
      filteredAttendance = filteredAttendance.filter(
        (d) => new Date(d.date).toDateString() === inputDate
      );
    }

    // Filter by status if provided
    if (status) {
      filteredAttendance = filteredAttendance.filter(
        (d) => d.status === status
      );
    }

    // Return the filtered attendance records
    return {
      status: 200,
      message: "Attendance fetched successfully",
      attendance: filteredAttendance,
    };
  } catch (error) {
    return { status: 500, message: error.message };
  }
};

const userAttendance = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { date, status } = req.body;

    const attendanceRecord = await Attendance.findOne({ userId });
    if (!attendanceRecord) {
      return { status: 404, message: "Attendance not found" };
    }

    let filteredAttendance = attendanceRecord.dates;

    if (date) {
      const inputDate = new Date(date).toDateString();
      filteredAttendance = filteredAttendance.filter(
        (d) => new Date(d.date).toDateString() === inputDate
      );
    }

    if (status) {
      filteredAttendance = filteredAttendance.filter(
        (d) => d.status === status
      );
    }

    return {
      status: 200,
      message: "Attendance fetched successfully",
      attendance: filteredAttendance,
    };
  } catch (error) {
    return { status: 500, message: error.message };
  }
};

module.exports = {
  addAttendance,
  viewAllAttendance,
  myAttendance,
  userAttendance,
};
