const express = require("express");
const userRouter = express.Router();

const permit = require("../../middleware/permissions");

const {
  getAllUsersController,
  getUserController,
  createUserController,
  updateUserController,
  deleteUserController,
  requestUserDeletionController,
  getDeletionRequestsController,
} = require("../controllers/user");

userRouter.get("/me", (req, res) => {
  res.json(req.user);
});

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

module.exports = userRouter;
