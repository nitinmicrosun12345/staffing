const express = require("express");
const attendanceRouter = express.Router();

const permit = require("../../middleware/permissions");
const {
  addAttendanceController,
  viewAllAttendanceController,
  myAttendanceController,
  userAttendanceController,
} = require("../controllers/attendance");

// attendanceRouter.get("/", (req, res) => {
//   res.send("Attendance route is up. 😊");
// });

attendanceRouter.post("/", myAttendanceController);

attendanceRouter.post("/add", addAttendanceController);

attendanceRouter.post(
  "/all",
  permit(["manageAttendance"]),
  viewAllAttendanceController
);

attendanceRouter.post(
  "/:userId",
  permit(["manageAttendance"]),
  userAttendanceController
);

module.exports = attendanceRouter;
