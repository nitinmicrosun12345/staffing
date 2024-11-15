const mongoose = require("mongoose");
const deletionRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  requestBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  // reason: { type: String, required: true },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
});
module.exports = mongoose.model("DeletionRequest", deletionRequestSchema);
