const User = require("../models/user");
const Attendance = require("../models/attendance");

const addAttendance = async (req) => {
  try {
    let { date, checkInTime, latitude, longitude } = req.body;

    // Convert date to IST    
    const originalDate = new Date(date);
    const istOffset = 5 * 60 + 30; // IST is UTC +5:30
    const utcDate = new Date(
      originalDate.getTime() + originalDate.getTimezoneOffset() * 60000
    );
    const istDate = new Date(utcDate.getTime() + istOffset * 60000);

    const userId = req.user._id;

    // Find the attendance record for the user
    const attendanceRecord = await Attendance.findOne({ userId });

    if (attendanceRecord) {
      // Check if attendance for the same date already exists
      const dateExists = attendanceRecord.dates.some(
        (d) => new Date(d.date).toDateString() === istDate.toDateString()
      );

      if (dateExists) {
        return { status: 400, message: "Attendance already marked for today" };
      }

      // Add new attendance entry to the existing document
      attendanceRecord.dates.push({
        date: istDate,
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
        message: `Attendance marked successfully ${istDate}`,
        attendance: updatedAttendance,
      };
    }

    // If no record exists, create a new document
    const newAttendance = new Attendance({
      userId,
      dates: [
        {
          date: istDate,
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
      message: "Attendance marked successfully",
      attendance: savedAttendance,
    };
  } catch (error) {
    return { status: 500, message: error.message };
  }
};

// const viewAllAttendance = async (req) => {
//   try {
//     const { date, status } = req.body;

//     let inputDate;
//     if (!date) {
//       return { status: 400, message: "Date is required" };
//     } else {
//       inputDate = new Date(date).toDateString();
//     }

//     // Build the query for filtering attendances
//     const query = {
//       dates: {
//         $elemMatch: {
//           date: {
//             $gte: new Date(inputDate),
//             $lt: new Date(new Date(inputDate).getTime() + 24 * 60 * 60 * 1000), // Next day's 12:00 AM
//           },
//         },
//       },
//     };

//     if (status) {
//       query["dates.status"] = status; // Add status filter
//     }

//     // Find attendance records with the filters and populate user details
//     const attendances = await Attendance.find(query).populate({
//       path: "userId", // Populate user details
//       select: "firstName lastName role department", // Fields to include
//     });

//     if (!attendances || attendances.length === 0) {
//       return {
//         status: 404,
//         message: "No attendance records found for the given criteria",
//         attendances: null,
//       };
//     }

//     // Filter the dates array to include only matching records
//     const filteredAttendances = attendances.map((attendance) => {
//       const filteredDates = attendance.dates.filter((d) => {
//         const recordDate = new Date(d.date).toDateString();
//         const matchesDate = recordDate === inputDate;
//         const matchesStatus = status ? d.status === status : true;
//         return matchesDate && matchesStatus;
//       });

//       return {
//         ...attendance._doc, // Spread the document properties
//         dates: filteredDates, // Replace dates with the filtered array
//       };
//     });

//     return {
//       status: 200,
//       message: "Attendance fetched successfully",
//       attendances: filteredAttendances,
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
    const { date, status } = req.body;

    if (!date) {
      return { status: 400, message: "Date is required" };
    }

    // Normalize input date to start of the day
    const inputDate = new Date(date).toDateString();

    // Fetch all users
    const users = await User.find({}, "firstName lastName role department empId");

    // Fetch attendance records for the specific date
    const attendanceRecords = await Attendance.find({
      dates: {
        $elemMatch: {
          date: {
            $gte: new Date(inputDate),
            $lt: new Date(new Date(inputDate).getTime() + 24 * 60 * 60 * 1000), // Next day's 12:00 AM
          },
        },
      },
    });

    // Map attendance records by userId for quick lookup
    const attendanceMap = attendanceRecords.reduce((acc, record) => {
      const filteredDates = record.dates.filter(
        (d) =>
          new Date(d.date).toDateString() === inputDate &&
          (!status || d.status === status)
      );
      if (filteredDates.length > 0) {
        acc[record.userId.toString()] = { ...record._doc, dates: filteredDates };
      }
      return acc;
    }, {});

    // Prepare the final list combining attendance and absent users
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
          empId: user.empId
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
    return {
      status: 500,
      message: error.message,
      attendances: null,
    };
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
      filteredAttendance = filteredAttendance.filter((d) => d.status === status);
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


const userAttendance = async (req,res) => {
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
      filteredAttendance = filteredAttendance.filter((d) => d.status === status);
    }

    return {
      status: 200,
      message: "Attendance fetched successfully",
      attendance: filteredAttendance,
    };
  } catch (error) {
    return { status: 500, message: error.message };
  }
}


module.exports = { addAttendance, viewAllAttendance, myAttendance, userAttendance };
