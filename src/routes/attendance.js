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

attendanceRouter.get("/", myAttendanceController);

attendanceRouter.post("/add", addAttendanceController);

attendanceRouter.get(
  "/all",
  permit(["manageAttendance"]),
  viewAllAttendanceController
);

attendanceRouter.get(
  "/:userId",
  permit(["manageAttendance"]),
  userAttendanceController
);

module.exports = attendanceRouter;
