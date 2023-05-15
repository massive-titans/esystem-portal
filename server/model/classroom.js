const mongoose = require("mongoose");

const classroomSchema = mongoose.Schema({
  classroomNumber: {type: String, required: true, trim: true, min: 1, max: 255},
  latitude: {type: Number, required: true, min: -90, max: 90},
  longitude: {type: Number, required: true, min: -180, max: 180},
});

module.exports = mongoose.model("Classroom", classroomSchema);
