const mongoose = require("mongoose");

const qrsessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, max: 40 },
  objectLocation: {
    latitude: { type: Number, required: true, min: -90, max: 90 },
    longitude: { type: Number, required: true, min: -180, max: 180 },
  },
  maxLength: { type: Number, required: true, min: 10, max: 255 },
  attendanceDuration: { type: Number, required: true, min: 5, max: 255 },
  singleSessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SingleSession",
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 2100,
  },
});

module.exports = mongoose.model("QRSession", qrsessionSchema);
