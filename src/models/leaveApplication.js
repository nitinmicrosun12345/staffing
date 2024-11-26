const mongoose = require("mongoose");

const leaveApplicationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  reason: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  appliedDate: { type: Date },
  parentApproval: {
    approved: { type: Boolean, default: false },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Parent ID
    approvedDate: { type: Date },
  },
  grandparentApproval: {
    approved: { type: Boolean, default: false },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Grandparent ID
    approvedDate: { type: Date },
  },
  adminApproval: {
    approved: { type: Boolean, default: null }, // Explicit admin approval
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Admin ID
    approvedDate: { type: Date },
  },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Manager/Admin who reviewed final status
  remarks: { type: String }, // For manager/admin remarks
});

module.exports = mongoose.model("LeaveApplication", leaveApplicationSchema);
