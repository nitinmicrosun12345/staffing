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
  updateSelfController,
  getDeletionRequestsController,
  deleteUserDirectController,
  dashboardController,
} = require("../controllers/user");

userRouter.get("/me", getMeController);

userRouter.post("/logout", logoutController);

userRouter.put("/", updateSelfController);

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

userRouter.post('/dashboard', permit(["viewDashboard"]), dashboardController);


module.exports = userRouter;
