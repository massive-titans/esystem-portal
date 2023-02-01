const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DynamicProfile",
      required: true,
      trim: true,
    },

    courseName: { type: String, required: true, trim: true, min: 1, max: 255 },
    courseShortName: {
      type: String,
      required: true,
      trim: true,
      min: 1,
      max: 255,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      trim: true,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    description: { type: String, trim: true, max: 2505 },
    totalCreadit: { type: Number, min: 1, max: 1000 },
    student: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
    ],
    hasAttendance: { type: mongoose.Schema.Types.ObjectId, ref: "Attendance" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Course", courseSchema);
