const express = require('express');
const attendanceRouter = express.Router();

const auth = require('../../middleware/auth');
const permit = require('../../middleware/permissions');
const { addAttendance } = require('../controllers/attendance');


attendanceRouter.get('/', (req, res) => {
  res.send('Attendance route is up. 😊');
});

// attendanceRouter.post('/add', addAttendance);



module.exports = attendanceRouter;
