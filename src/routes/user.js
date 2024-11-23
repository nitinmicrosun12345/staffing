const express = require("express");
const userRouter = express.Router();

const permit = require("../../middleware/permissions");

const {
  logoutController,
  getMeController,
  getAllUsersController,
  getUserController,
  createUserController,
  updateUserController,
  deleteUserViaRequestController,
  requestUserDeletionController,
  updateSelfController,
  getDeletionRequestsController,
  deleteUserDirectController,
  dashboardController,
  monthlySalaryController,

} = require("../controllers/user");

userRouter.get("/me", getMeController);

userRouter.post("/logout", logoutController);

userRouter.put("/", updateSelfController);

userRouter.get(
  "/",
  permit(["manageLabours"]),
  getAllUsersController
);

userRouter.get(
  "/:userId",
  permit(["manageLabours"]),
  getUserController
);

userRouter.post("/", permit(["manageLabours"]), createUserController);

userRouter.put(
  "/:userId",
  permit(["manageLabours", "manageEmployees", "manageManagers"]),
  updateUserController
);

userRouter.post(
  "/request/:userId",
  permit(["manageLabours"]),
  requestUserDeletionController
);

userRouter.delete(
  "/:requestId",
  permit(["manageManagers", "manageEmployees", "manageLabours"]),
  deleteUserViaRequestController
);

userRouter.delete(
  "/delete/:userId",
  permit(["manageManagers", "manageEmployees", "manageLabours"]),
  deleteUserDirectController
);

userRouter.post(
  "/requests",
  permit(["manageLabours"]),
  getDeletionRequestsController
);

userRouter.post("/dashboard", permit(["viewDashboard"]), dashboardController);

userRouter.post(
  "/salary/:userId",
  permit(["manageSalaries"]),
  monthlySalaryController
);

module.exports = userRouter;
