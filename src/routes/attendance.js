const express = require("express");
const attendanceRouter = express.Router();

const auth = require("../../middleware/auth");
const permit = require("../../middleware/permissions");
const { addAttendanceController,viewAllAttendanceController, myAttendanceController } = require("../controllers/attendance");

// attendanceRouter.get("/", (req, res) => {
//   res.send("Attendance route is up. 😊");
// });

attendanceRouter.get("/", auth, myAttendanceController);

attendanceRouter.post("/add", auth, addAttendanceController);

attendanceRouter.get("/all", auth, permit(['manageAttendance']), viewAllAttendanceController);




module.exports = attendanceRouter;
