const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  dates: [
    {
      date: { type: Date, required: true },
      status: { type: String, enum: ["present", "absent", "leave"], default: "present" },
      checkInTime: { type: String, required: true }, // hh:mm:ss
      checkOutTime: { type: String }, // hh:mm:ss
      latitude: { type: Number },
      longitude: { type: Number },
    },
  ],
});

module.exports = mongoose.model("Attendance", attendanceSchema);
