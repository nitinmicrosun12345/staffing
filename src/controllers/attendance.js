const { addAttendance } = require("../services/attendance");


const addAttendanceController = async (req, res) => {
  try {
    const response = await addAttendance(req, res);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { addAttendanceController };
