const express = require("express");
const leaveRouter = express.Router();

const permit = require("../../middleware/permissions");

const {
  createLeaveController,
  getLeavesController,
  updateLeaveController,
  getAllLeavesController,
} = require("../controllers/leave");

leaveRouter.post("/create", createLeaveController);
leaveRouter.get("/get", getLeavesController);
leaveRouter.put("/update/:leaveId", permit(['manageLeaves']), updateLeaveController);
leaveRouter.get("/all", permit(['manageLeaves']), getAllLeavesController);

module.exports = leaveRouter;
