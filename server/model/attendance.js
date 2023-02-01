const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, min: 1, max: 255 },
  description: { type: String, trim: true, max: 2505 },
  typeGrade: { type: String, trim: true, required: true },
  grade: { type: Number, trim: true },
  minGrade: { type: Number, trim: true },
  sessions: [
    {
      sessionRefs: { type: mongoose.Schema.Types.ObjectId, ref: "Session" },
      attendanceType: {
        type: String,
        trim: true,
        min: 1,
        max: 255,
        required: true,
        default: "All students",
      },
      startTime: { type: String, trim: true, required: true },
      endTime: { type: String, trim: true, required: true },
    },
  ],
});

module.exports = mongoose.model("Attendance", attendanceSchema);
