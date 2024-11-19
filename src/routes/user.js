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
  deleteUserController,
  requestUserDeletionController,
  getDeletionRequestsController,
  dashboardController
} = require("../controllers/user");

const auth = require("../../middleware/auth");

userRouter.get("/me", auth, getMeController);

userRouter.post("/logout", auth, logoutController);

userRouter.get("/", permit(["manageLabours"]), getAllUsersController);

userRouter.get(
  "/:userId",
  permit(["manageLabours", "manageEmployees", "manageManagers"]),
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
  deleteUserController
);

userRouter.post(
  "/requests",
  permit(["manageLabours"]),
  getDeletionRequestsController
);

userRouter.post('/dashboard', permit(["viewDashboard"]), dashboardController);


module.exports = userRouter;
