const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const teacherSchema = new mongoose.Schema({
  firstName: { type: String, required: true, min: 1, max: 255, trim: true },
  lastName: { type: String, required: true, min: 1, max: 255, trim: true },
  birthdate: { type: Date, required: true },
  creationDate: { type: Date, default: Date.now() },
  accountLogin: { type: ObjectId, ref: "Account" },
});

module.exports = mongoose.model("Teacher", teacherSchema);
