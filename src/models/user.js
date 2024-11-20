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
  empId: { type: String, unique: true }, // Unique employee ID
});

// Pre-save middleware to generate `empId`
userSchema.pre("save", async function (next) {
  if (!this.isNew) return next();

  try {
    const latestUser = await mongoose.model("User").findOne().sort({ _id: -1 });

    if (latestUser && latestUser.userId) {
      // Extract numeric part from the latest userId and increment it
      const lastIdNumber = parseInt(latestUser.userId.replace(/\D/g, ""), 10);
      this.empId = `EMP${(lastIdNumber + 1).toString().padStart(5, "0")}`;
    } else {
      // If no users exist, start from EMP00001
      this.empId = "EMP00001";
    }

    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model("User", userSchema);
