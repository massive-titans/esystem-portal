const mongoose = require("mongoose");
const student = require("./student");

const singleSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  students: [
    {
      student: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
      isPresent: {
        type: String,
        min: 1,
        max: 250,
        required: true,
        default: "Absent",
      },
      remark: { type: String, max: 2550 },
      point: { type: Number, min: 0, max: 100, required: true, default: 0 },
    },
  ],
});

module.exports = mongoose.model("SingleSession", singleSchema);
