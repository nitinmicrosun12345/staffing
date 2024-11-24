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
const auth = require("../../middleware/auth");

userRouter.get("/me", getMeController);

userRouter.post("/logout", logoutController);

userRouter.put("/updateSelf", updateSelfController);

userRouter.get(
  "/getAll",
  
  permit(["manageLabours"]),
  getAllUsersController
);

userRouter.get(
  "/get/:userId",
  
  permit(["manageLabours"]),
  getUserController
);

userRouter.post("/create", permit(["manageLabours"]), createUserController);

userRouter.put(
  "/update/:userId",
  
  permit(["manageLabours", "manageEmployees", "manageManagers"]),
  updateUserController
);

userRouter.post(
  "/request/:userId",
  
  permit(["manageLabours"]),
  requestUserDeletionController
);

userRouter.post(
  "/deleteViaRequest/:requestId",
  
  permit(["manageManagers", "manageEmployees", "manageLabours"]),
  deleteUserViaRequestController
);

userRouter.delete(
  "/delete/:userId",
  
  permit(["manageManagers", "manageEmployees", "manageLabours"]),
  deleteUserDirectController
);

userRouter.get(
  "/requests",
  
  permit(["manageLabours"]),
  getDeletionRequestsController
);

userRouter.get("/dashboard", permit(["viewDashboard"]), dashboardController);

userRouter.post(
  "/salary/:userId",
  permit(["manageSalaries"]),
  monthlySalaryController
);

userRouter.get("/hi",(req,res)=>{
  console.log("hi");
  
})

module.exports = userRouter;
