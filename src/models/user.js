const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  mobile: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  picture: { type: String },
  role: {
    type: String,
    enum: ["admin", "manager", "employee", "labour"],
    required: true,
  },
  gender: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  department: { type: String, required: true },
  dateOfJoining: { type: Date, required: true },
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  address: {
    street: { type: String },
    city: { type: String },
    state: { type: String },
    postalCode: { type: String },
    country: { type: String },
  },
  authKey: { type: String, default: "" },
});

module.exports = mongoose.model("User", userSchema);
