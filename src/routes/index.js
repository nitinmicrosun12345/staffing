const express = require("express");
const router = express.Router();

const auth = require("../../middleware/auth.js");

const { signupController, loginController } = require("../controllers/index");
    
router.post("/signup", signupController);

router.post("/login", loginController);

router.use("/user", auth, require("../routes/user.js"));

// router.use('/attendance', require('../routes/attendance.js'));

module.exports = router;
