const express = require("express");
const router = express.Router();

const userRouter = require("./user");
const attendanceRouter = require("./attendance");

const auth = require("../../middleware/auth.js");

const { signupController, loginController } = require("../controllers/index");
    
router.post("/signup", signupController);

router.post("/login", loginController);

router.use("/user", auth, userRouter);

router.use('/attendance',auth, attendanceRouter);

module.exports = router;
