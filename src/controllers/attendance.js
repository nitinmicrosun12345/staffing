const { addAttendance, viewAllAttendance, myAttendance, userAttendance } = require("../services/attendance");

const addAttendanceController = async (req, res) => {
  try {
    const response = await addAttendance(req);
    
    return res.status(response.status).json({
      message: response.message,
      attendance: response.attendance || null,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
const viewAllAttendanceController = async (req, res) => {
  try {
    const response = await viewAllAttendance(req,res);

    return res.status(response.status).json({
      message: response.message,
      attendances: response.attendances || null,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


const myAttendanceController = async (req, res) => {
  try {
    const response = await myAttendance(req);

    return res.status(response.status).json({
      message: response.message,
      attendance: response.attendance || null,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

const userAttendanceController = async (req, res) => {
  try {
    const response = await userAttendance(req,res);

    return res.status(response.status).json({
      message: response.message,
      attendance: response.attendance || null,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

module.exports = { addAttendanceController, viewAllAttendanceController, myAttendanceController, userAttendanceController };
