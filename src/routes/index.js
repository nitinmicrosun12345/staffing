const express = require("express");
const router = express.Router();

const auth = require("../../middleware/auth.js");

const { signupController, loginController } = require("../controllers/index");
const userRouter = require("./user");
const attendanceRouter = require("./attendance");
    
router.post("/signup", signupController);

router.post("/login", loginController);

router.use("/user", auth, userRouter);

router.use('/attendance',auth, attendanceRouter);



module.exports = router;
